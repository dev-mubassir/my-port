import { chromium } from 'playwright';
import { preview } from 'vite';

async function runMobileQA() {
  const server = await preview({ preview: { port: 4176 } });
  const browser = await chromium.launch();

  const widths = [360, 390, 412, 768];
  let failed = false;

  for (const w of widths) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('http://localhost:4176');
    await page.waitForTimeout(2200);

    // 1. Check document.documentElement.scrollWidth
    const overflowInfo = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const elements = Array.from(document.querySelectorAll('*'));
      const overflowingElements = [];

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        // check if element extends noticeably past the right viewport boundary
        if (rect.right > winW + 1.5 && rect.width > 0 && rect.height > 0) {
          const style = window.getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            overflowingElements.push({
              tag: el.tagName,
              className: el.className,
              id: el.id,
              right: rect.right,
              winW
            });
          }
        }
      }

      return {
        docW,
        winW,
        hasDocOverflow: docW > winW,
        overflowingElements: overflowingElements.slice(0, 5)
      };
    });

    console.log(`[${w}px] docW=${overflowInfo.docW}, winW=${overflowInfo.winW}, hasDocOverflow=${overflowInfo.hasDocOverflow}`);
    if (overflowInfo.hasDocOverflow) {
      console.error(`HORIZONTAL OVERFLOW at width ${w}px!`, overflowInfo.overflowingElements);
      failed = true;
    }

    // 2. Test Mobile Diagram Failure simulation button
    if (w <= 768) {
      const simBtn = page.locator('.btn-simulate-failure');
      await simBtn.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const initialText = await simBtn.innerText();
      console.log(`[${w}px] Simulate button initial text: "${initialText}"`);

      await simBtn.click();
      await page.waitForTimeout(300);
      const activeText = await simBtn.innerText();
      console.log(`[${w}px] Simulate button after click: "${activeText}"`);

      if (!activeText.includes('RESET') && !activeText.includes('NORMAL')) {
        console.error(`Simulate failure button did not change text on ${w}px!`);
        failed = true;
      }

      await simBtn.click(); // toggle back
      await page.waitForTimeout(200);
    }

    await page.close();
  }

  await browser.close();
  await server.close();

  if (failed) {
    console.error('Mobile QA tests FAILED!');
    process.exit(1);
  } else {
    console.log('ALL MOBILE QA TESTS PASSED WITH 0 OVERFLOWS!');
  }
}

runMobileQA().catch(err => {
  console.error(err);
  process.exit(1);
});
