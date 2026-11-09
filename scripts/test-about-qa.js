import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('test-results/about');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

async function runQA() {
  console.log(`Starting About Section QA Verification against ${BASE_URL}...`);
  const browser = await chromium.launch({
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  let totalFailed = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      totalFailed++;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Audio Engine Auto-Start & 36s Start Time Test
  // -------------------------------------------------------------
  console.log('\n--- TEST 1: Audio Engine Auto-Start & Sound Toggle ---');
  {
    const page = await browser.newPage();
    const audioRequests = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.endsWith('.mp3') || url.endsWith('.ogg') || url.includes('assets/track')) {
        audioRequests.push(url);
      }
    });

    await page.goto(BASE_URL);
    // Wait for slower preloader to complete (~4.2s)
    await page.waitForTimeout(4600);

    // Verify audio auto-started on open
    assert(audioRequests.length > 0, `Audio auto-started on open (requests: ${audioRequests.length})`);

    const navToggle = page.locator('#btn-sound-toggle-nav');
    const isNavToggleVisible = await navToggle.isVisible();
    assert(isNavToggleVisible, 'Sound toggle button is visible in site nav');

    const playingAriaPressed = await navToggle.getAttribute('aria-pressed');
    assert(playingAriaPressed === 'true', 'aria-pressed is true on auto-start');

    const hasPlayingClass = await navToggle.evaluate((el) => el.classList.contains('is-playing'));
    assert(hasPlayingClass, 'Nav button has is-playing class on auto-start');

    // Verify audio element state in page
    const audioState = await page.evaluate(() => {
      const audio = window._mubassirAudio || document.querySelector('audio');
      return {
        hasAudio: !!audio,
        paused: audio ? audio.paused : true,
        volume: audio ? audio.volume : 0,
        currentTime: audio ? audio.currentTime : 0,
        loop: audio ? audio.loop : false
      };
    });

    assert(audioState.hasAudio, 'Audio element exists in DOM/window');
    assert(!audioState.paused, 'Audio is actively auto-playing (!paused)');
    assert(audioState.currentTime >= 36, `Audio started from 36s (currentTime: ${audioState.currentTime.toFixed(2)}s)`);
    assert(audioState.volume > 0, `Audio volume faded in: ${audioState.volume.toFixed(2)}`);

    // Verify localStorage
    const storedState = await page.evaluate(() => localStorage.getItem('mubassir_sound_enabled'));
    assert(storedState === 'on', `LocalStorage stored preference is 'on' (got '${storedState}')`);

    // Verify tab visibility pausing
    console.log('Testing visibility change auto-pause/resume...');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(500);

    const pausedOnHidden = await page.evaluate(() => {
      const audio = window._mubassirAudio || document.querySelector('audio');
      return audio ? audio.paused : true;
    });
    assert(pausedOnHidden, 'Audio automatically paused when tab became hidden');

    // Restore visibility
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(800);

    const resumedOnVisible = await page.evaluate(() => {
      const audio = window._mubassirAudio || document.querySelector('audio');
      return audio ? !audio.paused : false;
    });
    assert(resumedOnVisible, 'Audio automatically resumed when tab became visible again');

    // Toggle sound OFF
    console.log('Toggling sound off...');
    await navToggle.click();
    await page.waitForTimeout(1000);

    const turnedOffAria = await navToggle.getAttribute('aria-pressed');
    assert(turnedOffAria === 'false', 'aria-pressed reverted to false');

    const storedStateOff = await page.evaluate(() => localStorage.getItem('mubassir_sound_enabled'));
    assert(storedStateOff === 'off', `LocalStorage stored preference is now 'off' (got '${storedStateOff}')`);

    await page.close();
  }

  // -------------------------------------------------------------
  // TEST 2: 3D Art Canvas & Motion Delta Test
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: 3D Art Piece & Motion Delta ---');
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL);
    await page.waitForFunction(() => !document.getElementById('preloader') || document.getElementById('preloader').style.display === 'none', { timeout: 10000 });
    await page.waitForTimeout(600);

    // Scroll to #about section
    await page.evaluate(() => {
      const about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(1200);

    const canvasLocator = page.locator('#about-art3d canvas');
    const canvasExists = await canvasLocator.count();
    assert(canvasExists > 0, 'Canvas element exists inside #about-art3d');

    // Check motion delta across 1 second
    const frame1 = await canvasLocator.screenshot();
    await page.waitForTimeout(1000);
    const frame2 = await canvasLocator.screenshot();

    // Verify frames are different (canvas is animating!)
    const isDifferent = !frame1.equals(frame2);
    assert(isDifferent, '3D Art canvas is actively animating (frame pixel delta > 0)');

    // Measure FPS over 2 seconds
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        function count() {
          frames++;
          if (performance.now() - start < 2000) {
            requestAnimationFrame(count);
          } else {
            const duration = (performance.now() - start) / 1000;
            resolve(frames / duration);
          }
        }
        requestAnimationFrame(count);
      });
    });
    console.log(`Measured Desktop FPS on About section: ${fps.toFixed(1)} fps`);
    assert(fps >= 40, `Desktop FPS >= 40 fps in headless renderer (measured ${fps.toFixed(1)} fps)`);

    await page.close();
  }

  // -------------------------------------------------------------
  // TEST 3: Typewriter Effect, Zero CLS & Text Integrity
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Typewriter Motion & Zero CLS ---');
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    // Monitor Layout Shift (CLS) on About section
    await page.addInitScript(() => {
      window._clsScore = 0;
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window._clsScore += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {}
    });

    await page.goto(BASE_URL);
    await page.waitForFunction(() => !document.getElementById('preloader') || document.getElementById('preloader').style.display === 'none', { timeout: 10000 });
    await page.waitForTimeout(600);

    // Record initial layout shifts before scrolling to about
    const initialCls = await page.evaluate(() => window._clsScore || 0);

    // Scroll to #about to trigger typing
    await page.evaluate(() => {
      const about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: 'instant' });
    });

    // Check caret appearance
    await page.waitForTimeout(1200);
    const caretCount = await page.locator('#about .type-caret').count();
    assert(caretCount > 0, 'Orange block caret exists in DOM during typing');

    // Wait for typing sequence to finish (~5 seconds)
    await page.waitForTimeout(5500);

    // Measure About CLS
    const finalCls = await page.evaluate(() => window._clsScore || 0);
    const aboutClsDelta = finalCls - initialCls;
    console.log(`Measured About section CLS delta: ${aboutClsDelta.toFixed(4)}`);
    assert(aboutClsDelta < 0.05, `CLS on About section is zero/negligible (${aboutClsDelta.toFixed(4)} < 0.05)`);

    // Verify text content is 100% intact
    const originalTextSnippets = [
      'I design, build and ship AI-powered software.',
      'Siffty, an AI platform that turns Instagram DMs into organised leads and replies.',
      'I built it in under six months and it was approved by Meta.',
      'I work with Python, FastAPI, Node.js and Next.js',
      'moving one classification task to a faster model cut Gemini token use by over 90 percent.',
      'I am now going deeper into Agentic AI, RAG and Deep Learning',
      'I am looking for an AI Engineer role where I can build and ship AI features with a team.'
    ];

    const bioText = await page.locator('#about .about-bio').innerText();
    for (const snippet of originalTextSnippets) {
      assert(bioText.includes(snippet), `Original text snippet preserved: "${snippet.slice(0, 40)}..."`);
    }

    // Verify rotating word in headline is still active
    const rotatorWord = await page.locator('#about .about-headline .rotator-word.is-active').innerText();
    assert(Boolean(rotatorWord), `Rotating word in headline is active: "${rotatorWord}"`);

    await page.close();
  }

  // -------------------------------------------------------------
  // TEST 4: prefers-reduced-motion Test
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: prefers-reduced-motion ---');
  {
    const page = await browser.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(BASE_URL);
    await page.waitForFunction(() => !document.getElementById('preloader') || document.getElementById('preloader').style.display === 'none', { timeout: 10000 });
    await page.waitForTimeout(600);

    await page.evaluate(() => {
      const about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(500);

    // Canvas should render a single static frame (no continuous delta)
    const canvasLocator = page.locator('#about-art3d canvas');
    const f1 = await canvasLocator.screenshot();
    await page.waitForTimeout(800);
    const f2 = await canvasLocator.screenshot();
    assert(f1.equals(f2), 'Canvas is completely static under prefers-reduced-motion');

    // Paragraphs should be immediately visible
    const charsOpacity = await page.evaluate(() => {
      const chars = Array.from(document.querySelectorAll('#about .type-char'));
      if (chars.length === 0) return 1;
      return parseFloat(window.getComputedStyle(chars[chars.length - 1]).opacity);
    });
    assert(charsOpacity > 0.5, 'Typewriter text is immediately fully visible without typing delay');

    await page.close();
  }

  // -------------------------------------------------------------
  // TEST 5: Responsive Verification & Visual Screenshots
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Responsive Viewports & Screenshots ---');
  const viewports = [
    { name: 'desktop-1920', width: 1920, height: 1080 },
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-412', width: 412, height: 915 },
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-360', width: 360, height: 800 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(BASE_URL);
    await page.waitForFunction(() => !document.getElementById('preloader') || document.getElementById('preloader').style.display === 'none', { timeout: 10000 });
    await page.waitForTimeout(600);

    // Scroll to #about
    await page.evaluate(() => {
      const about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(1000);

    // Check horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    assert(!overflow, `No horizontal scroll overflow at ${vp.name} (${vp.width}x${vp.height})`);

    // On mobile viewports (<= 768px): verify 3D art is in normal flow between headline and bio
    if (vp.width <= 768) {
      const positions = await page.evaluate(() => {
        const headline = document.querySelector('#about .about-headline').getBoundingClientRect();
        const art = document.querySelector('#about-art3d').getBoundingClientRect();
        const bio = document.querySelector('#about .about-bio').getBoundingClientRect();
        return {
          headlineBottom: headline.bottom,
          artTop: art.top,
          artBottom: art.bottom,
          bioTop: bio.top,
          hasCollisionWithBio: art.bottom > bio.top + 2
        };
      });

      assert(!positions.hasCollisionWithBio, `Mobile (${vp.width}px): Art (bottom: ${positions.artBottom.toFixed(0)}) sits cleanly above Bio (top: ${positions.bioTop.toFixed(0)}) with no text overlap`);
    }

    // Capture screenshot of About section
    const aboutLocator = page.locator('#about');
    await aboutLocator.screenshot({
      path: path.join(SCREENSHOT_DIR, `about-${vp.name}.png`)
    });
    console.log(`Saved screenshot: test-results/about/about-${vp.name}.png`);

    await page.close();
  }

  // -------------------------------------------------------------
  // TEST 6: Mobile Menu Overlay Sound Row Integration
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Mobile Menu Sound Row ---');
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(BASE_URL);
    await page.waitForFunction(() => !document.getElementById('preloader') || document.getElementById('preloader').style.display === 'none', { timeout: 10000 });
    await page.waitForTimeout(600);

    // Open mobile menu
    const menuBtn = page.locator('.btn-menu-dots');
    await menuBtn.click();
    await page.waitForTimeout(600);

    const menuSoundBtn = page.locator('#menu-overlay .btn-sound-toggle');
    const isMenuBtnVisible = await menuSoundBtn.isVisible();
    assert(isMenuBtnVisible, 'Sound toggle button is visible in full-screen mobile menu overlay');

    // Menu sound button starts active on open due to auto-start
    const isPlayingInitial = await menuSoundBtn.evaluate((el) => el.classList.contains('is-playing'));
    assert(isPlayingInitial, 'Menu sound button is initially active and playing due to auto-start');

    // Click menu toggle button to mute/pause sound
    await menuSoundBtn.click();
    await page.waitForTimeout(600);

    const isPlayingAfterClick = await menuSoundBtn.evaluate((el) => el.classList.contains('is-playing'));
    assert(!isPlayingAfterClick, 'Menu sound button toggled to off after click');

    // Close menu and check nav button state synchronization
    const closeBtn = page.locator('.btn-menu-close');
    await closeBtn.click();
    await page.waitForTimeout(600);

    const navBtnState = await page.locator('#btn-sound-toggle-nav').evaluate((el) => el.classList.contains('is-playing'));
    assert(!navBtnState, 'Site nav toggle button is synchronized with menu button state (both is-playing: false)');

    await page.close();
  }

  await browser.close();

  console.log(`\n========================================`);
  if (totalFailed === 0) {
    console.log(`🎉 ALL TESTS PASSED! (0 failures)`);
  } else {
    console.error(`💥 TOTAL FAILURES: ${totalFailed}`);
  }
  console.log(`========================================\n`);

  process.exit(totalFailed === 0 ? 0 : 1);
}

runQA().catch((err) => {
  console.error('QA Runner Exception:', err);
  process.exit(1);
});
