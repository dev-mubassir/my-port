import gsap from 'gsap';

export function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'custom-cursor-dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.className = 'custom-cursor-ring';
  document.body.appendChild(ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  const setDotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
  const setDotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });
  const setRingX = gsap.quickTo(ring, 'x', { duration: 0.28, ease: 'power3' });
  const setRingY = gsap.quickTo(ring, 'y', { duration: 0.28, ease: 'power3' });

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    setDotX(mouseX);
    setDotY(mouseY);
    setRingX(mouseX);
    setRingY(mouseY);
  }, { passive: true });

  // Hover detection
  const interactiveSelector = 'a, button, .interactive, [data-magnetic]';
  
  document.addEventListener('mouseover', e => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      document.body.classList.add('cursor--hover');
    }
  });

  document.addEventListener('mouseout', e => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      document.body.classList.remove('cursor--hover');
    }
  });

  // Touch listener to safely hide
  window.addEventListener('touchstart', () => {
    dot.style.display = 'none';
    ring.style.display = 'none';
  }, { once: true });

  // Magnetic elements
  initMagneticElements();
}

function initMagneticElements() {
  if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) return;
  const magnets = document.querySelectorAll('[data-magnetic]');
  magnets.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: relX * 0.28,
        y: relY * 0.28,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });
}
