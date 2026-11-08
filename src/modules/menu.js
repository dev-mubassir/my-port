export function initMenu() {
  const openBtn = document.querySelector('.btn-menu-dots');
  const closeBtn = document.querySelector('.btn-menu-close');
  const menu = document.getElementById('menu-overlay');
  const links = document.querySelectorAll('.menu-nav-link, .menu-social-links a');

  if (!menu || !openBtn) return;

  function openMenu() {
    menu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    menu.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    document.body.style.overflow = '';
    menu.setAttribute('aria-hidden', 'true');
  }

  openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // Close when clicking any menu link
  links.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // ESC key
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
}
