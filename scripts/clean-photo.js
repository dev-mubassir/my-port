import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processCutout() {
  console.log('Processing cutout to eliminate halo, fringe, and straight crop...');
  const inputPath = 'assets/test_u2net_human_seg.png';
  
  // 1. Load raw RGBA
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;

  // 2. Alpha threshold & defringe
  // Let's create an alpha mask buffer
  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    alpha[i] = data[i * 4 + 3];
  }

  // Erode alpha by 1-2 pixels to completely eliminate outer gray halo / fringe from checkerboard
  // A simple 2D erosion: new_alpha[y, x] = min(neighbors)
  const erodedAlpha = new Uint8Array(width * height);
  const radius = 1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minVal = 255;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const val = alpha[ny * width + nx];
            if (val < minVal) minVal = val;
          } else {
            minVal = 0;
          }
        }
      }
      erodedAlpha[y * width + x] = minVal;
    }
  }

  // Feather (slight blur) 1px to avoid harsh pixelated staircasing
  const featheredAlpha = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            sum += erodedAlpha[ny * width + nx];
            count++;
          }
        }
      }
      featheredAlpha[y * width + x] = Math.round(sum / count);
    }
  }

  // Also contour the right shoulder at y > 530 so it doesn't end in a harsh straight wall at x=580:
  // If the user's right sleeve ends at x=580, let's round the shoulder naturally down:
  for (let y = 520; y < height; y++) {
    // calculate a natural contour for the right sleeve:
    // At y=520, max X is ~545
    // At y=600, max X is ~560
    // At y=750, max X is ~565
    // At y=950, max X is ~565
    // Any x beyond the natural shoulder curve gets feathered to 0
    const progress = Math.min(1, (y - 520) / 100);
    const maxAllowedX = 545 + progress * 22; // max around 567
    for (let x = Math.floor(maxAllowedX); x < width; x++) {
      const dist = x - maxAllowedX;
      if (dist > 8) {
        featheredAlpha[y * width + x] = 0;
      } else {
        const factor = 1 - (dist / 8);
        featheredAlpha[y * width + x] = Math.round(featheredAlpha[y * width + x] * factor);
      }
    }
  }

  // High contrast grayscale conversion for the RGB channels, with clean background
  const cleanedData = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    let r = data[i * 4];
    let g = data[i * 4 + 1];
    let b = data[i * 4 + 2];
    let a = featheredAlpha[i];

    if (a < 15) {
      a = 0;
    }

    // High contrast grayscale:
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    // Boost contrast:
    gray = ((gray - 128) * 1.15) + 128;
    gray = Math.max(0, Math.min(255, gray));

    cleanedData[i * 4] = Math.round(gray);
    cleanedData[i * 4 + 1] = Math.round(gray);
    cleanedData[i * 4 + 2] = Math.round(gray);
    cleanedData[i * 4 + 3] = a;
  }

  // Now trim the transparent bounding box so no padding remains
  const trimmed = await sharp(cleanedData, {
    raw: { width, height, channels: 4 }
  }).trim().toBuffer({ resolveWithObject: true });

  console.log(`Trimmed dimensions: ${trimmed.info.width}x${trimmed.info.height}`);

  // Save master PNG
  const pngBuffer = await sharp(trimmed.data, {
    raw: { width: trimmed.info.width, height: trimmed.info.height, channels: 4 }
  }).png().toBuffer();
  fs.writeFileSync('assets/mubassir-new-cutout.png', pngBuffer);

  // Generate WebP with alpha:
  // Desktop: 1000px wide (under 200 KB)
  // Mobile: 600px wide (under 120 KB)
  await sharp(pngBuffer)
    .resize(1000, null, { withoutEnlargement: false })
    .webp({ quality: 88, alphaQuality: 92, effort: 6 })
    .toFile('assets/mubassir-new-cutout.webp');

  await sharp(pngBuffer)
    .resize(600, null, { withoutEnlargement: false })
    .webp({ quality: 82, alphaQuality: 88, effort: 6 })
    .toFile('assets/mubassir-new-cutout-800.webp');

  const statD = fs.statSync('assets/mubassir-new-cutout.webp');
  const statM = fs.statSync('assets/mubassir-new-cutout-800.webp');

  console.log(`Desktop WebP: 1000px wide, size = ${Math.round(statD.size / 1024)} KB (<200 KB target)`);
  console.log(`Mobile WebP: 600px wide, size = ${Math.round(statM.size / 1024)} KB (<120 KB target)`);

  // Verify against backgrounds: Paper (#DCDCDC), Orange (#FF4B2B), Ink (#0A0A0A)
  const bgTests = [
    { name: 'paper', hex: '#DCDCDC' },
    { name: 'orange', hex: '#FF4B2B' },
    { name: 'ink', hex: '#0A0A0A' }
  ];

  for (const bg of bgTests) {
    const compositeTest = await sharp({
      create: {
        width: 1200,
        height: 2000,
        channels: 4,
        background: bg.hex
      }
    })
    .composite([{ input: 'assets/mubassir-new-cutout.webp', gravity: 'south' }])
    .png()
    .toFile(`screenshots/test_fringe_${bg.name}.png`);
    console.log(`Generated fringe test for ${bg.name}`);
  }
}

processCutout().catch(err => {
  console.error(err);
  process.exit(1);
});
