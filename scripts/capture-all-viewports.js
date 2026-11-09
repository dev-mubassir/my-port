import { chromium } from 'playwright';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 800, dpr: 3 },
  { name: 'mobile-390', width: 390, height: 844, dpr: 3 },
  { name: 'mobile-412', width: 412, height: 915, dpr: 2.625 },
  { name: 'tablet-768', width: 768, height: 1024, dpr: 2 },
  { name: 'desktop-1280', width: 1280, height: 800, dpr: 1 },
  { name: 'desktop-1440', width: 1440, height: 900, dpr: 1 },
  { name: 'desktop-1920', width: 1920, height: 1080, dpr: 1 }
];

async function capture() {
  const server = await preview({ preview: { port: 4177 } });
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    console.log(`Capturing ${vp.name}...`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr
    });

    await page.goto('http://localhost:4177');
    await page.waitForTimeout(2300);

    // Full page
    await page.screenshot({ path: `screenshots/${vp.name}-full.png`, fullPage: true });

    // Section crops on 360 and 1440
    if (vp.name === 'mobile-360' || vp.name === 'desktop-1440') {
      const sections = ['hero', 'about', 'siffty', 'projects', 'skills', 'timeline', 'contact'];
      for (const sec of sections) {
        const el = page.locator(`#${sec}`);
        if (await el.count() > 0) {
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
          await el.screenshot({ path: `screenshots/${vp.name}-${sec}.png` });
        }
      }
    }

    await page.close();
  }

  await browser.close();
  await server.close();
  console.log('All screenshots captured successfully in screenshots/!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
