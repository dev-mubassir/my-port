import sharp from 'sharp';

async function process() {
  const input = 'assets/mubassir-new-cutout.png';

  // Desktop high-contrast grayscale WebP
  await sharp(input)
    .grayscale()
    .linear(1.15, -10)
    .webp({ quality: 90 })
    .toFile('assets/mubassir-new-cutout.webp');

  // Mobile version (800px max dimension)
  await sharp(input)
    .resize({ height: 800, withoutEnlargement: true })
    .grayscale()
    .linear(1.15, -10)
    .webp({ quality: 85 })
    .toFile('assets/mubassir-new-cutout-800.webp');

  const mDesktop = await sharp('assets/mubassir-new-cutout.webp').metadata();
  const mMobile = await sharp('assets/mubassir-new-cutout-800.webp').metadata();

  console.log('Desktop WebP generated:', mDesktop.width, 'x', mDesktop.height, mDesktop.size, 'bytes');
  console.log('Mobile WebP generated:', mMobile.width, 'x', mMobile.height, mMobile.size, 'bytes');
}

process().catch(console.error);
