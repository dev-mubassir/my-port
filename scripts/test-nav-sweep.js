import { chromium } from 'playwright';
import { preview } from 'vite';

async function sweep() {
  const server = await preview({ preview: { port: 4173 } });
  const browser = await chromium.launch();

  const viewports = [
    { width: 1440, height: 900, name: 'desktop-1440' },
    { width: 360, height: 800, name: 'mobile-360' }
  ];

  let anyFailed = false;

  for (const vp of viewports) {
    console.log(`\nStarting scroll sweep on ${vp.name}...`);
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:4173');
    await page.waitForTimeout(2200);

    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

    let mismatches = 0;
    for (let y = 0; y <= maxScroll; y += 150) {
      await page.evaluate(top => window.scrollTo(0, top), y);
      await page.waitForTimeout(60);

      const result = await page.evaluate(() => {
        const header = document.querySelector('.site-header');
        const theme = header.getAttribute('data-theme');
        const navHeight = header.offsetHeight || 56;
        const checkY = navHeight + 8;
        const checkX = Math.min(window.innerWidth / 2, 300);

        const hit = document.elementFromPoint(checkX, checkY);
        const section = hit ? hit.closest('section[data-nav-theme], footer[data-nav-theme]') : null;
        const expectedTheme = section ? section.getAttribute('data-nav-theme') : 'light';

        return {
          scrollY: window.scrollY,
          theme,
          expectedTheme,
          sectionId: section ? (section.id || section.className) : 'none'
        };
      });

      if (result.theme !== result.expectedTheme) {
        console.error(`MISMATCH at scrollY=${result.scrollY} on ${vp.name}: nav theme=${result.theme}, expected=${result.expectedTheme} (section=${result.sectionId})`);
        mismatches++;
      }
    }

    console.log(`Finished ${vp.name}: ${mismatches} mismatches.`);
    if (mismatches > 0) anyFailed = true;
    await page.close();
  }

  await browser.close();
  await server.close();

  if (anyFailed) {
    console.error('Nav sweep test FAILED.');
    process.exit(1);
  } else {
    console.log('ALL NAV SWEEP TESTS PASSED WITH 0 MISMATCHES!');
  }
}

sweep().catch(err => {
  console.error(err);
  process.exit(1);
});
