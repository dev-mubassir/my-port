export function initTextScramble() {
  const elements = document.querySelectorAll('[data-scramble]');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#/';

  elements.forEach(el => {
    const originalText = el.textContent.trim();
    let frame = 0;
    let timer = null;

    el.addEventListener('mouseenter', () => {
      cancelAnimationFrame(timer);
      frame = 0;
      const totalFrames = 14;

      function update() {
        frame++;
        const progress = frame / totalFrames;
        const settledCount = Math.floor(progress * originalText.length);

        let output = originalText.substring(0, settledCount);
        for (let i = settledCount; i < originalText.length; i++) {
          if (originalText[i] === ' ' || originalText[i] === '—' || originalText[i] === '·') {
            output += originalText[i];
          } else {
            output += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        el.textContent = output;

        if (frame < totalFrames) {
          timer = requestAnimationFrame(update);
        } else {
          el.textContent = originalText;
        }
      }

      timer = requestAnimationFrame(update);
    });
  });
}
