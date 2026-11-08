import sharp from 'sharp';

async function findMinMax() {
  const image = sharp('assets/reference/web.jpg');
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  let minLum = 999;
  let minPixel = null;
  // look inside card bounds
  for (let y = 180; y < 550; y++) {
    for (let x = 60; x < 250; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < minLum) {
        minLum = lum;
        minPixel = { x, y, r, g, b, hex: '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase() };
      }
    }
  }
  console.log('Deepest ink in card text:', minPixel);
}

findMinMax().catch(console.error);
