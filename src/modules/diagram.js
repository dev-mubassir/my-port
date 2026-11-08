import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initArchitectureDiagram() {
  const svg = document.querySelector('.architecture-svg');
  if (!svg) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Paths
  const paths = svg.querySelectorAll('.arch-connector--signal');
  paths.forEach(path => {
    const length = path.getTotalLength ? path.getTotalLength() : 300;
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length
    });

    if (!prefersReduced) {
      gsap.to(path, {
        scrollTrigger: {
          trigger: '.siffty-diagram-wrapper',
          start: 'top 75%'
        },
        strokeDashoffset: 0,
        duration: 1.8,
        ease: 'power2.inOut',
        stagger: 0.2
      });
    } else {
      gsap.set(path, { strokeDashoffset: 0 });
    }
  });

  // Pulse animation along the primary branch
  if (!prefersReduced) {
    const pulseDots = svg.querySelectorAll('.pulse-dot');
    pulseDots.forEach((dot, i) => {
      gsap.to(dot, {
        opacity: 0.2,
        scale: 1.4,
        transformOrigin: 'center center',
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        delay: i * 0.2
      });
    });
  }
}
