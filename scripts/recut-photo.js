import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function recut() {
  console.log('Running @imgly/background-removal-node on assets/mubassir-new.png...');
  const inputPath = path.resolve('assets/mubassir-new.png');
  
  // Use large or medium model
  const blob = await removeBackground(inputPath, {
    model: 'large',
    output: {
      format: 'image/png',
      quality: 1.0
    }
  });

  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const rawCutoutPath = path.resolve('assets/mubassir-new-raw.png');
  fs.writeFileSync(rawCutoutPath, buffer);
  console.log('Raw cutout saved:', rawCutoutPath);

  // Now process with sharp:
  // 1. Trim transparent edges
  // 2. Remove halo / fringe:
  // We can inspect the alpha channel, trim bounding box, erode 1px if needed
  const image = sharp(buffer);
  const metadata = await image.metadata();
  console.log('Cutout metadata:', metadata.width, metadata.height, metadata.channels);

  // Trim to bounding box
  const trimmed = await sharp(buffer).trim().toBuffer({ resolveWithObject: true });
  console.log('Trimmed size:', trimmed.info.width, trimmed.info.height);

  // Clean alpha: extract alpha, apply slight threshold to eliminate faint semi-transparent fringes / pale background leftovers
  const { data, info } = await sharp(trimmed.data).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  // Clean semi-transparent fringe
  for (let i = 0; i < data.length; i += channels) {
    const a = data[i + 3];
    if (a < 25) {
      data[i + 3] = 0; // eliminate very faint haze
    }
  }

  // Save the cleaned PNG
  const cleanedBuffer = await sharp(data, {
    raw: { width, height, channels }
  }).png().toBuffer();

  const finalPngPath = path.resolve('assets/mubassir-new-cutout.png');
  fs.writeFileSync(finalPngPath, cleanedBuffer);

  // Export WebP with alpha:
  // Desktop: 1000px wide (under 200 KB)
  // Mobile: 600px wide (under 120 KB)
  const desktopWebPPath = path.resolve('assets/mubassir-new-cutout.webp');
  const mobileWebPPath = path.resolve('assets/mubassir-new-cutout-800.webp'); // 600px mobile WebP

  await sharp(cleanedBuffer)
    .resize(1000, null, { withoutEnlargement: false, fit: 'inside' })
    .webp({ quality: 90, alphaQuality: 95, effort: 6 })
    .toFile(desktopWebPPath);

  await sharp(cleanedBuffer)
    .resize(600, null, { withoutEnlargement: false, fit: 'inside' })
    .webp({ quality: 85, alphaQuality: 90, effort: 6 })
    .toFile(mobileWebPPath);

  const desktopStat = fs.statSync(desktopWebPPath);
  const mobileStat = fs.statSync(mobileWebPPath);

  console.log(`Desktop WebP (1000px): ${Math.round(desktopStat.size / 1024)} KB (target < 200 KB)`);
  console.log(`Mobile WebP (600px): ${Math.round(mobileStat.size / 1024)} KB (target < 120 KB)`);
}

recut().catch(err => {
  console.error('Error during recut:', err);
  process.exit(1);
});

