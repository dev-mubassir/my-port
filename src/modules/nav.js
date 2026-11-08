import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAdaptiveNavbar() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Initial theme
  header.setAttribute('data-theme', 'light');

  // Track sections for dark/light theme switching
  const sections = document.querySelectorAll('section[data-nav-theme]');
  sections.forEach(section => {
    const theme = section.getAttribute('data-nav-theme');
    ScrollTrigger.create({
      trigger: section,
      start: 'top 40px',
      end: 'bottom 40px',
      onEnter: () => header.setAttribute('data-theme', theme),
      onEnterBack: () => header.setAttribute('data-theme', theme)
    });
  });

  // Hide on scroll down, show on scroll up, solid bg after 80px
  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;

        // Solid background toggle
        if (currentY > 80) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }

        // Hide / Show on scroll direction
        if (currentY > lastScrollY && currentY > 180) {
          // Scrolling down
          if (!header.classList.contains('menu-open')) {
            header.classList.add('is-hidden');
          }
        } else if (currentY < lastScrollY) {
          // Scrolling up
          header.classList.remove('is-hidden');
        }

        lastScrollY = Math.max(0, currentY);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

