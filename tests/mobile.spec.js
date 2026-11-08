import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Mobile 360px (Small Android)', width: 360, height: 740 },
  { name: 'Mobile 390px (iPhone 12/13/14)', width: 390, height: 844 },
  { name: 'Mobile 412px (Pixel / Galaxy)', width: 412, height: 915 },
  { name: 'Tablet 768px (iPad Mini)', width: 768, height: 1024 }
];

test.describe('Mobile Viewports & Responsiveness Suite', () => {
  for (const vp of VIEWPORTS) {
    test(`Zero horizontal scroll on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Wait for preloader to complete
      await page.waitForTimeout(2200);

      // Verify no horizontal overflow at the top
      let scrollWidth = await page.evaluate(() => document.scrollingElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width);

      // Scroll through each major section and verify scrollWidth never exceeds viewport width
      const sections = ['#about', '#siffty', '#projects', '#skills', '#timeline', '#contact'];
      for (const sel of sections) {
        await page.evaluate(s => {
          const el = document.querySelector(s);
          if (el) el.scrollIntoView();
        }, sel);
        await page.waitForTimeout(150);

        scrollWidth = await page.evaluate(() => document.scrollingElement.scrollWidth);
        expect(scrollWidth).toBeLessThanOrEqual(vp.width);
      }
    });
  }

  test('Takes full-page screenshots at 1440px and 390px', async ({ page }) => {
    // 1440px Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(2200);
    await page.screenshot({ path: 'screenshots/desktop-1440.png', fullPage: false });

    // 390px Mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(2200);
    await page.screenshot({ path: 'screenshots/mobile-390.png', fullPage: false });
  });

  test('Mobile floating HIRE ME pill behavior on 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(2200);

    const pill = page.locator('#mobile-hire-pill');

    // Scroll past hero
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(300);
    await expect(pill).toHaveClass(/is-visible/);

    // Scroll into contact section
    await page.evaluate(() => {
      document.querySelector('#contact').scrollIntoView();
    });
    await page.waitForTimeout(300);
    await expect(pill).not.toHaveClass(/is-visible/);
  });
});

