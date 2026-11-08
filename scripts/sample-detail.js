import sharp from 'sharp';

async function sampleAreas() {
  const image = sharp('assets/reference/web.jpg');
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  function getPixelHex(x, y) {
    const idx = (y * info.width + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  // Paper background around top left of the inner card
  console.log('Paper (200, 350):', getPixelHex(200, 350));
  console.log('Paper (150, 200):', getPixelHex(150, 200));
  // Ink black text
  console.log('Ink black ("001" center ~ x: 100, y: 660):', getPixelHex(100, 660));
  console.log('Ink black ("lab" stem ~ x: 100, y: 480):', getPixelHex(100, 480));
  // Outer canvas backdrop gray
  console.log('Backdrop outer gray (x: 50, y: 50):', getPixelHex(50, 50));
  console.log('Card border frame (x: 36, y: 200):', getPixelHex(36, 200));
}

sampleAreas().catch(console.error);
