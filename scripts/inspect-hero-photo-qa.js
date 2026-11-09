import { chromium } from 'playwright';
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
  { name: 'desktop-1280', width: 1280, height: 800, dpr: 1 },
  { name: 'desktop-1440', width: 1440, height: 900, dpr: 1 },
  { name: 'desktop-1920', width: 1920, height: 1080, dpr: 1 }
];

async function runQA() {
  console.log('--- STARTING HERO PHOTO QA LOOP ---');
  const browser = await chromium.launch();
  let anyFailed = false;

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting ${vp.name} (${vp.width}x${vp.height}, DPR ${vp.dpr})...`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr
    });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    // Wait for loader curtain wipe and entrance animations to complete
    await page.waitForTimeout(3800);

    const check = await page.evaluate(() => {
      const hero = document.getElementById('hero');
      const photo = document.querySelector('.hero-photo-img');
      const wrapper = document.querySelector('.hero-photo-wrapper');
      const band = document.querySelector('.hero-orange-band');
      const headline = document.querySelector('.hero-headline');
      const tagline = document.querySelector('.hero-tagline');
      const bandBtn = document.querySelector('.hero-band-btn');
      const badge = document.querySelector('.hero-badge-wrapper');

      const heroRect = hero.getBoundingClientRect();
      const photoRect = photo.getBoundingClientRect();
      const bandRect = band.getBoundingClientRect();
      const headlineRect = headline.getBoundingClientRect();
      const taglineRect = tagline.getBoundingClientRect();
      const btnRect = bandBtn ? bandBtn.getBoundingClientRect() : null;
      const badgeRect = badge ? badge.getBoundingClientRect() : null;

      const docW = document.scrollingElement.scrollWidth;
      const winW = window.innerWidth;
      const isMobile = winW <= 768;

      // Face region is top 36% of the photo, between 28% and 65% width
      const faceRect = {
        top: photoRect.top,
        bottom: photoRect.top + photoRect.height * 0.36,
        left: photoRect.left + photoRect.width * 0.28,
        right: photoRect.left + photoRect.width * 0.65
      };

      function overlaps(r1, r2) {
        if (!r1 || !r2) return false;
        return !(
          r1.right <= r2.left ||
          r1.left >= r2.right ||
          r1.bottom <= r2.top ||
          r1.top >= r2.bottom
        );
      }

      return {
        isMobile,
        docW,
        winW,
        hasOverflow: docW > winW,
        photoRect: {
          left: Math.round(photoRect.left),
          right: Math.round(photoRect.right),
          top: Math.round(photoRect.top),
          bottom: Math.round(photoRect.bottom),
          width: Math.round(photoRect.width),
          height: Math.round(photoRect.height)
        },
        heroBottom: Math.round(heroRect.bottom),
        bandTop: Math.round(bandRect.top),
        headAboveBand: photoRect.top < bandRect.top,
        fitsInViewport: photoRect.left >= 0 && photoRect.right <= winW + 2,
        sitsFlushBottom: Math.abs(photoRect.bottom - heroRect.bottom) <= 2,
        headlineOverlapsFace: overlaps(headlineRect, faceRect),
        taglineOverlapsFace: overlaps(taglineRect, faceRect),
        btnOverlapsFace: btnRect ? overlaps(btnRect, faceRect) : false,
        badgeOverlapsFace: badgeRect ? overlaps(badgeRect, faceRect) : false
      };
    });

    console.log(`- Horizontal overflow: ${check.hasOverflow ? 'FAIL' : 'PASS'} (docW=${check.docW}, winW=${check.winW})`);
    console.log(`- Console errors: ${consoleErrors.length}`);
    console.log(`- Photo fits in viewport: ${check.fitsInViewport ? 'PASS' : 'FAIL'} (left=${check.photoRect.left}, right=${check.photoRect.right}, winW=${check.winW})`);
    console.log(`- Head above orange band: ${check.headAboveBand ? 'PASS' : 'FAIL'} (photoTop=${check.photoRect.top}, bandTop=${check.bandTop})`);
    console.log(`- Sits flush on bottom: ${check.sitsFlushBottom ? 'PASS' : 'FAIL'} (photoBottom=${check.photoRect.bottom}, heroBottom=${check.heroBottom})`);
    console.log(`- Face overlap: headline=${check.headlineOverlapsFace}, tagline=${check.taglineOverlapsFace}, btn=${check.btnOverlapsFace}, badge=${check.badgeOverlapsFace}`);

    const mobileFaceOverlap = check.isMobile && (
      check.headlineOverlapsFace ||
      check.taglineOverlapsFace ||
      check.btnOverlapsFace ||
      check.badgeOverlapsFace
    );

    if (
      check.hasOverflow ||
      consoleErrors.length > 0 ||
      !check.fitsInViewport ||
      !check.headAboveBand ||
      !check.sitsFlushBottom ||
      mobileFaceOverlap
    ) {
      console.error(`FAILED assertions on ${vp.name}!`);
      anyFailed = true;
    }

    // Capture hero screenshot
    const heroEl = page.locator('#hero');
    await heroEl.screenshot({ path: `screenshots/hero-qa-${vp.name}.png` });
    console.log(`Saved screenshot: screenshots/hero-qa-${vp.name}.png`);

    await page.close();
  }

  await browser.close();

  if (anyFailed) {
    console.error('\nQA LOOP FAILED! Fix issues before proceeding.');
    process.exit(1);
  } else {
    console.log('\n--- ALL QA ASSERTIONS PASSED ACROSS ALL 6 VIEWPORTS! ---');
  }
}

runQA().catch(err => {
  console.error(err);
  process.exit(1);
});
