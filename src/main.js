import { initLoader } from './modules/loader.js';
import { initHero } from './modules/hero.js';
import { initGlitch } from './modules/glitch.js';
import { initRotators } from './modules/rotator.js';
import { initCursor } from './modules/cursor.js';
import { initScroll } from './modules/scroll.js';
import { initMenu } from './modules/menu.js';
import { initAdaptiveNavbar } from './modules/nav.js';
import { initAbout } from './modules/about.js';
import { initSiffty } from './modules/siffty.js';
import { initProjects } from './modules/projects.js';
import { initSkills } from './modules/skills.js';
import { initTimeline } from './modules/timeline.js';
import { initContact } from './modules/contact.js';
import { initTextScramble } from './modules/scramble.js';
import { initAudioController } from './modules/audio.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Smooth Scrolling & Progress
  initScroll();

  // Initialize Custom Magnetic Cursor
  initCursor();

  // Initialize Rotators & Scramblers
  initRotators();
  initTextScramble();

  // Initialize Audio & Sound Controller
  initAudioController();

  // Initialize Full-Screen Menu Overlay & Adaptive Nav
  initMenu();
  initAdaptiveNavbar();

  // Initialize Sections
  initHero();
  initGlitch();
  initAbout();
  initSiffty();
  initProjects();
  initSkills();
  initTimeline();
  initContact();

  // Run Animated Preloader
  initLoader(() => {
    console.log('Mubassir Shah Portfolio loaded successfully.');
  });
});
