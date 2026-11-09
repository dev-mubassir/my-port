import { test, expect } from '@playwright/test';

test.describe('Mubassir Shah Portfolio Suite', () => {
  test('Page loads, runs loader, and renders hero correctly', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');

    // Verify Title and Meta
    await expect(page).toHaveTitle(/Mubassir Shah/);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /Mubassir Shah/);

    // Wait for loader curtain wipe
    await page.waitForTimeout(2200);

    // Verify Hero
    const heroHeadline = page.locator('.hero-headline');
    await expect(heroHeadline).toBeVisible();
    await expect(heroHeadline).toContainText('Mubassir');

    // Verify 5 rotating word headlines exist
    const rotators = page.locator('.rotator-container');
    await expect(rotators).toHaveCount(5);

    // Verify Siffty Section & metrics
    const sifftySection = page.locator('#siffty');
    await expect(sifftySection).toBeVisible();
    await expect(page.locator('.metric-num').first()).toContainText('99.6%');

    // Verify Architecture Diagram SVG & Simulation button
    const svgDiagram = page.locator('.architecture-svg');
    await expect(svgDiagram).toBeVisible();

    const simBtn = page.locator('.btn-simulate-failure');
    await expect(simBtn).toContainText('SIMULATE CLOUD TIMEOUT');
    await simBtn.click();
    await expect(simBtn).toContainText('RESET TO PRIMARY ROUTE');
    await simBtn.click();
    await expect(simBtn).toContainText('SIMULATE CLOUD TIMEOUT');

    // Verify Projects Grid (4 projects with media preview)
    const projectCards = page.locator('.project-card');
    await expect(projectCards).toHaveCount(4);
    const projectImages = page.locator('.project-card-media img');
    await expect(projectImages).toHaveCount(4);
    // Card 01 is real Siffty dashboard (no placeholder caption); other cards have Illustrative preview
    const projectCaptions = page.locator('.project-card-caption');
    await expect(projectCaptions).toHaveCount(3);
    await expect(projectCaptions.first()).toContainText('Illustrative preview');

    // Verify Open Graph and Twitter image
    const ogImg = page.locator('meta[property="og:image"]');
    await expect(ogImg).toHaveAttribute('content', /og-image\.webp/);

    // Verify Skills Marquee & Philosophy
    const marquee = page.locator('.marquee-wrapper');
    await expect(marquee).toBeVisible();
    const philosophyCards = page.locator('.philosophy-card');
    await expect(philosophyCards).toHaveCount(4);

    // Verify Timeline Milestones (7 items including Upcoming)
    const timelineItems = page.locator('.timeline-item');
    await expect(timelineItems).toHaveCount(7);
    const upcomingItem = page.locator('.timeline-item--upcoming');
    await expect(upcomingItem).toBeVisible();
    await expect(upcomingItem).toContainText('Upcoming: B.Sc. graduation');
    await expect(upcomingItem).toContainText('UPCOMING');

    // Verify Contact & Recruiter Card
    const contactHeadline = page.locator('.contact-headline');
    await expect(contactHeadline).toContainText('Open to AI Engineer roles');

    const recruiterCard = page.locator('.recruiter-card');
    await expect(recruiterCard).toBeVisible();
    await expect(recruiterCard).toContainText('RECRUITER SNAPSHOT');
    await expect(recruiterCard).toContainText('Python, FastAPI, Next.js');

    // Test copy email button
    const copyEmailBtn = page.locator('#btn-copy-email');
    await expect(copyEmailBtn).toBeVisible();
    await copyEmailBtn.click();
    await expect(page.locator('#copy-email-text')).toContainText('Copied');

    // Verify Schema.org Person JSON-LD
    const jsonLd = await page.locator('script[type="application/ld+json"]').innerText();
    const parsedLd = JSON.parse(jsonLd);
    expect(parsedLd.name).toBe('Mubassir Shah');
    expect(parsedLd.jobTitle).toBe('AI Engineer');

    // Verify 3-Column Footer & Wordmark
    const footerWordmark = page.locator('.footer-wordmark');
    await expect(footerWordmark).toContainText('Mubassir');
    const footerCols = page.locator('.footer-col');
    await expect(footerCols).toHaveCount(3);

    // Verify Resume link
    const resumeBtn = page.locator('a[download="Mubassir_Shah_Resume.pdf"]').first();
    await expect(resumeBtn).toHaveAttribute('href', 'assets/Mubassir_Shah_Resume.pdf');

    // Verify 0 console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('Menu overlay opens and closes with stress test and restores scroll', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const openBtn = page.locator('.btn-menu-dots');
    const closeBtn = page.locator('.btn-menu-close');
    const menu = page.locator('#menu-overlay');

    // Rapid open/close stress test
    for (let i = 0; i < 3; i++) {
      await openBtn.click();
      await page.waitForTimeout(450);
      await closeBtn.click();
      await page.waitForTimeout(450);
    }

    await expect(menu).not.toHaveClass(/is-open/);

    // Verify scrolling works after close
    const beforeScroll = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(200);
    const afterScroll = await page.evaluate(() => window.scrollY);
    expect(afterScroll).toBeGreaterThan(beforeScroll);

    // Verify adaptive navbar updates theme: light on Siffty, dark on Contact
    await page.evaluate(() => {
      const siffty = document.querySelector('#siffty');
      window.scrollTo(0, siffty.offsetTop + 100);
    });
    await page.waitForTimeout(300);
    const navHeader = page.locator('.site-header');
    await expect(navHeader).toHaveAttribute('data-theme', 'light');

    await page.evaluate(() => {
      const contact = document.querySelector('#contact');
      window.scrollTo(0, contact.offsetTop + 100);
    });
    await page.waitForTimeout(300);
    await expect(navHeader).toHaveAttribute('data-theme', 'dark');
  });
});
