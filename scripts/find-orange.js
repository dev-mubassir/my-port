import sharp from 'sharp';

async function findDominantColors() {
  const image = sharp('assets/reference/web.jpg');
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  // Find highest saturation / most vibrant red-orange pixels
  let maxVibrance = 0;
  let orangePixel = null;
  let paperPixels = [];
  let inkPixels = [];

  for (let y = 0; y < info.height; y += 4) {
    for (let x = 0; x < info.width; x += 4) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // check if it's the bright orange band: r should be high, g moderate, b low
      if (r > 180 && g > 40 && g < 120 && b < 80) {
        const vibrance = r - (g + b) / 2;
        if (vibrance > maxVibrance) {
          maxVibrance = vibrance;
          orangePixel = { x, y, r, g, b, hex: '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase() };
        }
      }
    }
  }

  console.log('Peak Orange Pixel:', orangePixel);
}

findDominantColors().catch(console.error);
