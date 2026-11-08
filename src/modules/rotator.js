import gsap from 'gsap';

export function initRotators() {
  const containers = document.querySelectorAll('.rotator-container');
  if (!containers.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  containers.forEach(container => {
    const rawWords = container.getAttribute('data-words');
    if (!rawWords) return;

    let words = [];
    try {
      words = JSON.parse(rawWords);
    } catch {
      words = rawWords.split(',').map(s => s.trim());
    }

    if (words.length <= 1) return;

    let currentIndex = 0;
    const box = container.querySelector('.rotator-word-box') || container;

    // Create active and next elements
    box.innerHTML = '';
    const activeSpan = document.createElement('span');
    activeSpan.className = 'rotator-word is-active';
    activeSpan.textContent = words[0];

    const nextSpan = document.createElement('span');
    nextSpan.className = 'rotator-word is-next';
    nextSpan.textContent = words[1];

    box.appendChild(activeSpan);
    box.appendChild(nextSpan);

    // Initial width
    requestAnimationFrame(() => {
      container.style.width = `${activeSpan.offsetWidth}px`;
    });

    if (prefersReduced) return;

    // Interval loop
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % words.length;
      nextSpan.textContent = words[nextIndex];

      // Measure target width
      nextSpan.style.opacity = '0';
      nextSpan.style.position = 'absolute';
      const targetWidth = nextSpan.offsetWidth;

      // Animate container width smoothly
      gsap.to(container, {
        width: targetWidth,
        duration: 0.4,
        ease: 'power3.out'
      });

      // 3D vertical flip timeline
      const tl = gsap.timeline({
        onComplete: () => {
          activeSpan.textContent = words[nextIndex];
          gsap.set(activeSpan, { rotateX: 0, opacity: 1 });
          gsap.set(nextSpan, { rotateX: -90, opacity: 0 });
          currentIndex = nextIndex;
        }
      });

      tl.to(activeSpan, {
        rotateX: 90,
        opacity: 0,
        duration: 0.42,
        ease: 'power2.in'
      })
      .fromTo(
        nextSpan,
        { rotateX: -90, opacity: 0 },
        {
          rotateX: 0,
          opacity: 1,
          duration: 0.48,
          ease: 'power2.out'
        },
        '-=0.15'
      );
    }, 2200);

    // Save cleanup
    container._rotatorCleanup = () => clearInterval(interval);
  });
}
