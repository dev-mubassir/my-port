import gsap from 'gsap';

export function initLoader(onComplete) {
  const preloader = document.getElementById('preloader');
  const counterEl = document.querySelector('.loader-counter');
  const wordEl = document.querySelector('.loader-word');
  const curtain = document.querySelector('.curtain-wipe');

  if (!preloader || !counterEl) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    preloader.style.display = 'none';
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const targetWord = 'Mubassir.';
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_#<>!/';
  const state = { value: 0 };

  const tl = gsap.timeline({
    onComplete: () => {
      // Curtain wipe reveal
      const exitTl = gsap.timeline({
        onComplete: () => {
          preloader.style.display = 'none';
          if (curtain) curtain.style.display = 'none';
          if (typeof onComplete === 'function') {
            onComplete();
          }
          window.dispatchEvent(new CustomEvent('portfolio:ready'));
        }
      });

      exitTl
        .to(preloader, {
          yPercent: -100,
          duration: 0.95,
          ease: 'power4.inOut'
        })
        .fromTo(
          curtain,
          { yPercent: 100 },
          {
            yPercent: -100,
            duration: 1.05,
            ease: 'power4.inOut'
          },
          '-=0.85'
        );
    }
  });

  // Smooth, slightly slower loading counter and word assembly (2.8s count-up + 0.35s rest)
  tl.to(state, {
    value: 100,
    duration: 2.8,
    ease: 'power2.inOut',
    onUpdate: () => {
      const current = Math.floor(state.value);
      counterEl.textContent = String(current).padStart(3, '0');

      // Glitch / type in word based on progress
      const progress = state.value / 100;
      const lettersCount = Math.floor(progress * targetWord.length);

      let text = targetWord.substring(0, lettersCount);
      if (lettersCount < targetWord.length) {
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        text += randomChar;
      }
      if (wordEl) {
        wordEl.innerHTML = text.replace('.', '<span class="dot">.</span>');
      }
    }
  }).to({}, { duration: 0.35 });
}
