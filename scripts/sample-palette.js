import sharp from 'sharp';

async function sample() {
  const image = sharp('assets/reference/web.jpg');
  const metadata = await image.metadata();
  console.log('Image dimensions:', metadata.width, metadata.height);

  // Let's sample specific regions:
  // 1. Background paper (e.g. top-left area: x: 100, y: 100)
  // 2. Ink black (e.g. "lab." text area: x: 150, y: 470)
  // 3. Orange band (e.g. middle-left: x: 400, y: 600)
  // 4. Backdrop frame or outer canvas gray (e.g. corner: x: 20, y: 20)
  
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  function getPixelHex(x, y) {
    const idx = (y * info.width + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    return { hex, r, g, b };
  }

  console.log('Paper sample (x: 200, y: 200):', getPixelHex(200, 200));
  console.log('Paper sample (x: 150, y: 300):', getPixelHex(150, 300));
  console.log('Orange sample (x: 400, y: 600):', getPixelHex(400, 600));
  console.log('Orange sample (x: 450, y: 550):', getPixelHex(450, 550));
  console.log('Ink sample ("lab." area x: 140, y: 460):', getPixelHex(140, 460));
  console.log('Backdrop outer sample (x: 20, y: 20):', getPixelHex(20, 20));
  console.log('Frame line sample (around card border x: 50, y: 240):', getPixelHex(50, 240));
}

sample().catch(console.error);
