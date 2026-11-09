export function initGlitch() {
  const container = document.querySelector('.hero-photo-wrapper');
  if (!container) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Set mask images dynamically to match current image asset
  const maskUrl = 'url("assets/photo-final-cutout.webp")';
  const inkSlice = container.querySelector('.glitch-slice--ink');
  const signalSlice = container.querySelector('.glitch-slice--signal');
  
  if (inkSlice) {
    inkSlice.style.webkitMaskImage = maskUrl;
    inkSlice.style.maskImage = maskUrl;
  }
  if (signalSlice) {
    signalSlice.style.webkitMaskImage = maskUrl;
    signalSlice.style.maskImage = maskUrl;
  }

  function triggerBurst(durationMs = 280) {
    container.classList.add('is-glitching');
    setTimeout(() => {
      container.classList.remove('is-glitching');
    }, durationMs);
  }

  // Hover trigger
  container.addEventListener('mouseenter', () => {
    triggerBurst(360);
  });

  // Random periodic bursts every 3 to 6 seconds
  let glitchTimer;
  function scheduleNextBurst() {
    const nextInterval = 3000 + Math.random() * 3000;
    glitchTimer = setTimeout(() => {
      triggerBurst(240);
      scheduleNextBurst();
    }, nextInterval);
  }
  scheduleNextBurst();

  // Strong burst during loader reveal
  window.addEventListener('portfolio:ready', () => {
    triggerBurst(650);
  });

  return () => {
    clearTimeout(glitchTimer);
  };
}
