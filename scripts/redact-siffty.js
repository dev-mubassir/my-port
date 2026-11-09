import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function redact() {
  const inputPath = 'assets/real/siffty/siffty-dashboard.jpg';
  const img = sharp(inputPath);
  const metadata = await img.metadata();
  console.log(`Original image: ${metadata.width}x${metadata.height}`);

  // Define sensitive regions to blur (x, y, width, height)
  // Coordinates based on 1024x560 image:
  const regions = [
    // Top right user profile avatar/name:
    { left: 890, top: 30, width: 45, height: 45, sigma: 8 },

    // Left conversation list avatars (x: 180 to 220):
    { left: 180, top: 115, width: 42, height: 435, sigma: 12 },

    // Left conversation list names & message previews (x: 224 to 385):
    // Row 1: Priya Sharma
    { left: 224, top: 120, width: 155, height: 35, sigma: 8 },
    // Row 2: Rohan Mehta
    { left: 224, top: 180, width: 155, height: 35, sigma: 8 },
    // Row 3: Travel With Neha
    { left: 224, top: 240, width: 155, height: 35, sigma: 8 },
    // Row 4: Sneha Kapoor
    { left: 224, top: 300, width: 155, height: 35, sigma: 8 },
    // Row 5: Aditya Verma
    { left: 224, top: 360, width: 155, height: 35, sigma: 8 },
    // Row 6: Megha Jain
    { left: 224, top: 420, width: 155, height: 35, sigma: 8 },
    // Row 7: Arjun Malhotra
    { left: 224, top: 480, width: 155, height: 35, sigma: 8 },

    // Middle Chat pane:
    // Header contact avatar & name:
    { left: 405, top: 78, width: 34, height: 34, sigma: 10 },
    { left: 442, top: 82, width: 95, height: 22, sigma: 8 },

    // Chat message 1 avatar & bubble text:
    { left: 402, top: 168, width: 32, height: 32, sigma: 10 },
    { left: 442, top: 160, width: 220, height: 60, sigma: 8 },

    // Chat message 2 (outbound reply bubble) - blur recipient name:
    { left: 518, top: 260, width: 55, height: 22, sigma: 8 },

    // Chat message 3 avatar & bubble text:
    { left: 402, top: 348, width: 32, height: 32, sigma: 10 },
    { left: 442, top: 345, width: 220, height: 55, sigma: 8 },

    // Right sidebar: AI reply draft customer name and message body:
    { left: 755, top: 388, width: 60, height: 20, sigma: 8 }, // "Hi Priya"
    { left: 755, top: 410, width: 220, height: 65, sigma: 7 }, // draft text
  ];

  // For each region, extract, blur, and composite back
  let compositeOps = [];

  for (const r of regions) {
    const cropped = await sharp(inputPath)
      .extract({ left: r.left, top: r.top, width: r.width, height: r.height })
      .blur(r.sigma)
      .toBuffer();

    compositeOps.push({
      input: cropped,
      left: r.left,
      top: r.top
    });
  }

  // Composite all blurred regions onto base image
  const redactedBuffer = await sharp(inputPath)
    .composite(compositeOps)
    .toBuffer();

  // Save redacted preview to verify
  await sharp(redactedBuffer).toFile('assets/real/siffty-redacted-preview.jpg');
  console.log('Saved assets/real/siffty-redacted-preview.jpg');

  // Generate WebP outputs:
  // Desktop: 1600 px wide, under 150 KB
  // Mobile: 800 px wide, under 150 KB
  // Maintain aspect ratio: original is 1024x560 (ratio 1.82857)
  // When scaled to 1600 width: height = round(1600 * 560 / 1024) = 875
  // When scaled to 800 width: height = round(800 * 560 / 1024) = 438

  const desktopWebP = await sharp(redactedBuffer)
    .resize(1600, 875, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 82, effort: 6 })
    .toBuffer();

  const mobileWebP = await sharp(redactedBuffer)
    .resize(800, 438, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();

  console.log(`Desktop WebP size: ${(desktopWebP.length / 1024).toFixed(1)} KB (target < 150 KB)`);
  console.log(`Mobile WebP size: ${(mobileWebP.length / 1024).toFixed(1)} KB (target < 150 KB)`);

  fs.writeFileSync('assets/projects/siffty-1600.webp', desktopWebP);
  fs.writeFileSync('assets/projects/siffty-800.webp', mobileWebP);
  console.log('Saved assets/projects/siffty-1600.webp and assets/projects/siffty-800.webp');
}

redact().catch(console.error);
