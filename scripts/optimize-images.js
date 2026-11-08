import sharp from 'sharp';

async function processCutout() {
  const input = 'assets/mubassir-cutout.png';
  
  // Create high-contrast grayscale WebP and PNG versions
  // We preserve the alpha channel, grayscale the RGB channels, and adjust contrast
  await sharp(input)
    .grayscale()
    .linear(1.2, -15) // Boost contrast: slightly darker shadows, crisper highlights
    .webp({ quality: 90 })
    .toFile('assets/mubassir-cutout.webp');

  await sharp(input)
    .grayscale()
    .linear(1.2, -15)
    .png({ compressionLevel: 8 })
    .toFile('assets/mubassir-cutout-contrast.png');

  // Replace mubassir-cutout.png with high-contrast version
  const fs = await import('fs');
  fs.copyFileSync('assets/mubassir-cutout-contrast.png', 'assets/mubassir-cutout.png');
  fs.unlinkSync('assets/mubassir-cutout-contrast.png');

  console.log('Optimized grayscale high-contrast cutout and WebP generated!');
}

processCutout().catch(console.error);
