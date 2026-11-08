import { getLenis } from './scroll.js';

export function initMenu() {
  const openBtn = document.querySelector('.btn-menu-dots');
  const closeBtn = document.querySelector('.btn-menu-close');
  const menu = document.getElementById('menu-overlay');
  const navHeader = document.querySelector('.site-header');
  const dropdownWrapper = document.querySelector('.nav-dropdown-wrapper');
  const dropdownTrigger = document.querySelector('.nav-dropdown-trigger');

  if (!menu || !openBtn) return;

  // State machine: 'idle' | 'opening' | 'open' | 'closing'
  let state = 'idle';
  let transitionTimer = null;

  function setAria(isOpen) {
    menu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    openBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  function openMenu() {
    if (state === 'opening' || state === 'open' || state === 'closing') return;
    state = 'opening';
    clearTimeout(transitionTimer);

    try {
      const lenis = getLenis();
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
      if (navHeader) navHeader.classList.add('menu-open');
      menu.classList.add('is-open');
      setAria(true);

      transitionTimer = setTimeout(() => {
        state = 'open';
        if (closeBtn) closeBtn.focus();
      }, 400);
    } catch (err) {
      console.error('Error opening menu:', err);
      state = 'open';
    }
  }

  function closeMenu(onClosedCallback) {
    if (state === 'closing' || state === 'idle') return;
    state = 'closing';
    clearTimeout(transitionTimer);

    try {
      menu.classList.remove('is-open');
      if (navHeader) navHeader.classList.remove('menu-open');
      setAria(false);

      transitionTimer = setTimeout(() => {
        try {
          // ensure unlock
        } finally {
          const lenis = getLenis();
          if (lenis) lenis.start();
          document.body.style.overflow = '';
          state = 'idle';
          if (typeof onClosedCallback === 'function') {
            onClosedCallback();
          } else if (openBtn) {
            openBtn.focus();
          }
        }
      }, 400);
    } catch (err) {
      console.error('Error closing menu:', err);
      const lenis = getLenis();
      if (lenis) lenis.start();
      document.body.style.overflow = '';
      state = 'idle';
    }
  }

  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state === 'idle') openMenu();
    else if (state === 'open') closeMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  // Handle menu navigation links: close first, then scrollTo
  const navLinks = menu.querySelectorAll('.menu-nav-link, .menu-social-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetEl = document.querySelector(href);
        closeMenu(() => {
          if (targetEl) {
            const lenis = getLenis();
            if (lenis) {
              lenis.scrollTo(targetEl, { offset: -20 });
            } else {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      }
    });
  });

  // ESC key to close menu or dropdown
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (state === 'open' || state === 'opening') {
        closeMenu();
      }
      closeDropdown();
    }
  });

  // Window resize: always restart Lenis and ensure body unlocked
  window.addEventListener('resize', () => {
    if (state === 'open' || state === 'opening') {
      closeMenu();
    } else {
      const lenis = getLenis();
      if (lenis) lenis.start();
      document.body.style.overflow = '';
      state = 'idle';
    }
  });

  // --- CONTACT Dropdown Behavior ---
  function closeDropdown() {
    if (dropdownWrapper) {
      dropdownWrapper.classList.remove('is-open');
      dropdownTrigger?.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleDropdown(e) {
    e.stopPropagation();
    if (!dropdownWrapper) return;
    const isOpen = dropdownWrapper.classList.contains('is-open');
    if (isOpen) {
      closeDropdown();
    } else {
      dropdownWrapper.classList.add('is-open');
      dropdownTrigger?.setAttribute('aria-expanded', 'true');
    }
  }

  if (dropdownTrigger) {
    dropdownTrigger.addEventListener('click', toggleDropdown);
  }

  // Close dropdown on outside click
  document.addEventListener('click', e => {
    if (dropdownWrapper && !dropdownWrapper.contains(e.target)) {
      closeDropdown();
    }
  });

  // Close dropdown on scroll
  window.addEventListener('scroll', () => {
    closeDropdown();
  }, { passive: true });
}
