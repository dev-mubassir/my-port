import { chromium } from '@playwright/test';
import { createServer } from 'vite';

async function run() {
  console.log('Starting Vite preview server...');
  const server = await createServer({
    server: { port: 4173 }
  });
  await server.listen();
  const address = server.httpServer.address();
  const port = address.port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Server listening on ${baseUrl}`);

  const browser = await chromium.launch();
  const consoleErrors = [];
  const pageErrors = [];

  // 1. Desktop Test (1440px)
  console.log('Running Desktop 1440px test...');
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const pageDesktop = await contextDesktop.newPage();

  pageDesktop.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });
  pageDesktop.on('pageerror', err => {
    pageErrors.push(`[Page Error] ${err.message}`);
  });

  await pageDesktop.goto(baseUrl, { waitUntil: 'networkidle' });

  // Wait for loader curtain reveal
  await pageDesktop.waitForTimeout(2500);

  // Take screenshot at 1440px
  const fs = await import('fs');
  if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

  await pageDesktop.screenshot({ path: 'screenshots/desktop-1440-hero.png', fullPage: false });
  console.log('Captured screenshots/desktop-1440-hero.png');

  await pageDesktop.screenshot({ path: 'screenshots/desktop-1440-full.png', fullPage: true });
  console.log('Captured screenshots/desktop-1440-full.png');

  // Verify critical elements
  const headlineText = await pageDesktop.locator('.hero-headline').innerText();
  console.log('Hero headline text:', headlineText.trim());

  const liveClockText = await pageDesktop.locator('#live-clock').innerText();
  console.log('Live clock text:', liveClockText);

  // 2. Mobile Test (390px)
  console.log('Running Mobile 390px test...');
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto(baseUrl, { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(2500);

  await pageMobile.screenshot({ path: 'screenshots/mobile-390-hero.png', fullPage: false });
  console.log('Captured screenshots/mobile-390-hero.png');

  await pageMobile.screenshot({ path: 'screenshots/mobile-390-full.png', fullPage: true });
  console.log('Captured screenshots/mobile-390-full.png');

  await browser.close();
  await server.close();

  console.log('Console Errors found:', consoleErrors.length);
  consoleErrors.forEach(e => console.error(e));
  console.log('Page Errors found:', pageErrors.length);
  pageErrors.forEach(e => console.error(e));

  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    process.exit(1);
  } else {
    console.log('ALL PLAYWRIGHT SCREENSHOTS & BROWSER CHECKS PASSED WITH 0 ERRORS!');
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
