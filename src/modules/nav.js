export function initAdaptiveNavbar() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  if (!header.getAttribute('data-theme')) {
    header.setAttribute('data-theme', 'light');
  }

  function updateNavTheme() {
    const navHeight = header.offsetHeight || 56;
    // Sample directly below the bottom edge of the nav
    const sampleY = navHeight + 6;
    const sampleX = Math.min(window.innerWidth / 2, 400);

    const hit = document.elementFromPoint(sampleX, sampleY);
    if (!hit) return;

    // Detect only top-level sections or footer carrying data-nav-theme
    const target = hit.closest('section[data-nav-theme], footer[data-nav-theme]');
    if (target) {
      const theme = target.getAttribute('data-nav-theme');
      if (theme) {
        header.setAttribute('data-theme', theme);
      }
    }
  }

  // Initial update
  updateNavTheme();

  // Scroll handler with requestAnimationFrame
  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;

        // Theme detection at nav bottom edge
        updateNavTheme();

        // Hide on scroll down, show on scroll up
        if (currentY > lastScrollY && currentY > 150) {
          if (!header.classList.contains('menu-open')) {
            header.classList.add('is-hidden');
          }
        } else if (currentY < lastScrollY) {
          header.classList.remove('is-hidden');
        }

        lastScrollY = Math.max(0, currentY);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateNavTheme, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(updateNavTheme, 100);
  });
}
