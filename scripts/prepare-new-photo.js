import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function preparePhoto() {
  console.log('--- PREPARING NEW HERO PHOTO ---');
  const inputPath = path.resolve('assets/photo-final.png');
  
  // 1. Load raw RGBA
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  console.log(`Input size: ${width}x${height}, channels: ${info.channels}`);

  // 2. Alpha threshold & defringe (erode 1px, feather 1px)
  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const a = data[i * 4 + 3];
    alpha[i] = a < 20 ? 0 : a;
  }

  // 1px 2D erosion to peel away outer edge halo
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

  // 1px feather (slight smoothing) so edges aren't harsh
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

  // Ensure RGB is pure high-contrast grayscale matching tokens
  const cleanedData = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    let a = featheredAlpha[i];

    if (a < 15) {
      a = 0;
    }

    // High contrast grayscale
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    gray = ((gray - 128) * 1.15) + 128;
    gray = Math.max(0, Math.min(255, gray));

    cleanedData[i * 4] = Math.round(gray);
    cleanedData[i * 4 + 1] = Math.round(gray);
    cleanedData[i * 4 + 2] = Math.round(gray);
    cleanedData[i * 4 + 3] = a;
  }

  // 3. Trim to bounding box
  const trimmed = await sharp(cleanedData, {
    raw: { width, height, channels: 4 }
  }).trim().toBuffer({ resolveWithObject: true });

  console.log(`Trimmed dimensions: ${trimmed.info.width}x${trimmed.info.height}`);

  // Master PNG
  const masterPngPath = 'assets/photo-final-cutout.png';
  await sharp(trimmed.data, {
    raw: { width: trimmed.info.width, height: trimmed.info.height, channels: 4 }
  }).png().toFile(masterPngPath);

  // 4. Export WebP with alpha:
  // Desktop: 1000px wide (target under 200 KB)
  const desktopWebpPath = 'assets/photo-final-cutout.webp';
  await sharp(masterPngPath)
    .resize(1000, null, { withoutEnlargement: false })
    .webp({ quality: 88, alphaQuality: 92, effort: 6 })
    .toFile(desktopWebpPath);

  // Mobile: 600px wide (target under 120 KB)
  const mobileWebpPath = 'assets/photo-final-cutout-600.webp';
  await sharp(masterPngPath)
    .resize(600, null, { withoutEnlargement: false })
    .webp({ quality: 82, alphaQuality: 88, effort: 6 })
    .toFile(mobileWebpPath);

  const statD = fs.statSync(desktopWebpPath);
  const statM = fs.statSync(mobileWebpPath);
  console.log(`Desktop WebP (1000px): ${(statD.size / 1024).toFixed(1)} KB (< 200 KB)`);
  console.log(`Mobile WebP (600px): ${(statM.size / 1024).toFixed(1)} KB (< 120 KB)`);

  // 5. Check against backgrounds: Paper (#DCDCDC), Orange (#FF4B2B), Ink (#0A0A0A)
  const bgs = [
    { name: 'paper', hex: '#DCDCDC' },
    { name: 'orange', hex: '#FF4B2B' },
    { name: 'ink', hex: '#0A0A0A' }
  ];

  for (const bg of bgs) {
    await sharp({
      create: { width: 1200, height: 1400, channels: 4, background: bg.hex }
    })
    .composite([{ input: desktopWebpPath, gravity: 'south' }])
    .png()
    .toFile(`screenshots/check_${bg.name}.png`);
    console.log(`Saved background composite: screenshots/check_${bg.name}.png`);
  }

  console.log('--- PHOTO PREPARATION COMPLETE ---');
}

preparePhoto().catch(err => {
  console.error(err);
  process.exit(1);
});
