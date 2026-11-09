import { chromium } from 'playwright';
import { preview } from 'vite';

async function testAnchors() {
  const server = await preview({ preview: { port: 4174 } });
  const browser = await chromium.launch();

  for (const vp of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    const page = await browser.newPage();
    await page.setViewportSize(vp);
    await page.goto('http://localhost:4174');
    await page.waitForTimeout(2200);

    const navLinks = ['#projects', '#about', '#skills', '#contact'];
    for (const href of navLinks) {
      await page.evaluate((selector) => {
        const el = document.querySelector(selector);
        el.scrollIntoView({ behavior: 'auto' });
      }, href);
      await page.waitForTimeout(100);

      const target = await page.evaluate((selector) => {
        const el = document.querySelector(selector);
        const rect = el.getBoundingClientRect();
        const header = document.querySelector('.site-header');
        const headerRect = header.getBoundingClientRect();
        return {
          top: rect.top,
          headerBottom: headerRect.bottom,
          isVisibleBelowHeader: rect.top >= headerRect.bottom - 2
        };
      }, href);
      console.log(`[${vp.width}px] Anchor ${href}: top=${target.top.toFixed(1)}, headerBottom=${target.headerBottom.toFixed(1)}, visible=${target.isVisibleBelowHeader}`);
      if (!target.isVisibleBelowHeader) {
        throw new Error(`[${vp.width}px] Anchor ${href} is obscured by header!`);
      }
    }
    await page.close();
  }

  await browser.close();
  await server.close();
  console.log('ALL ANCHOR TESTS PASSED!');
}

testAnchors().catch(err => {
  console.error(err);
  process.exit(1);
});
