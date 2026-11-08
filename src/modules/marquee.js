import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initMarquee() {
  const rows = document.querySelectorAll('.marquee-row');
  if (!rows.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  rows.forEach((row, i) => {
    const isReverse = row.classList.contains('marquee-row--reverse');
    const content = row.querySelector('.marquee-content');
    if (!content) return;

    // Clone content once for seamless looping
    const clone = content.cloneNode(true);
    row.appendChild(clone);

    const direction = isReverse ? 1 : -1;
    let xPos = 0;
    const baseSpeed = 1.2;
    let currentSpeed = baseSpeed;
    let targetSkew = 0;
    let currentSkew = 0;

    if (prefersReduced) return;

    // Monitor scroll velocity via ScrollTrigger
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = (currentScrollY - lastScrollY);
      lastScrollY = currentScrollY;
      
      // Clamp velocity
      const clampedVel = Math.max(-40, Math.min(40, scrollVelocity));
      targetSkew = clampedVel * -0.22;
      currentSpeed = baseSpeed + Math.abs(clampedVel) * 0.15;
    }, { passive: true });

    gsap.ticker.add(() => {
      // Ease skew
      currentSkew += (targetSkew - currentSkew) * 0.1;
      targetSkew *= 0.92; // dampening
      
      // Decay speed back to base
      currentSpeed += (baseSpeed - currentSpeed) * 0.05;

      const singleWidth = content.offsetWidth;
      xPos += currentSpeed * direction;

      if (direction === -1 && xPos <= -singleWidth) {
        xPos += singleWidth;
      } else if (direction === 1 && xPos >= 0) {
        xPos -= singleWidth;
      }

      row.style.transform = `translate3d(${xPos}px, 0, 0) skewX(${currentSkew}deg)`;
    });
  });
}
