import { chromium } from 'playwright';
import { preview } from 'vite';

async function testHero() {
  const server = await preview({ preview: { port: 4173 } });
  const browser = await chromium.launch();

  // Desktop 1865px
  const pageDesktop = await browser.newPage();
  await pageDesktop.setViewportSize({ width: 1865, height: 900 });
  await pageDesktop.goto('http://localhost:4173');
  await pageDesktop.waitForTimeout(2200);
  await pageDesktop.screenshot({ path: 'screenshots/hero-desktop-1865.png' });

  // Desktop 1440px
  const page1440 = await browser.newPage();
  await page1440.setViewportSize({ width: 1440, height: 900 });
  await page1440.goto('http://localhost:4173');
  await page1440.waitForTimeout(2200);
  await page1440.screenshot({ path: 'screenshots/hero-desktop-1440.png' });

  // Mobile 360px (DPR 3)
  const contextMobile = await browser.newContext({
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto('http://localhost:4173');
  await pageMobile.waitForTimeout(2200);
  await pageMobile.screenshot({ path: 'screenshots/hero-mobile-360.png' });

  // Check 001 position on desktop
  const bounds001 = await pageDesktop.locator('.hero-index-001').boundingBox();
  console.log('001 bounds on desktop 1865:', bounds001);

  // Check photo count in DOM
  const photoCount = await pageMobile.locator('#hero img').count();
  console.log('Hero photo img count on mobile:', photoCount);

  // Check ghost text element count
  const ghostText1px = await pageDesktop.evaluate(() => {
    const els = document.querySelectorAll('#hero *');
    return Array.from(els).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.height === 1 && rect.width > 20 && el.innerText.trim().length > 0;
    }).map(el => el.outerHTML);
  });
  console.log('Stray 1px elements with text:', ghostText1px.length);

  await browser.close();
  await server.close();
}

testHero().catch(err => {
  console.error(err);
  process.exit(1);
});
