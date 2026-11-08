import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initTimeline() {
  const section = document.getElementById('timeline');
  if (!section) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Track progress fill
  const progressLine = document.querySelector('.timeline-track-progress');
  if (progressLine) {
    gsap.to(progressLine, {
      scrollTrigger: {
        trigger: '#timeline .timeline-list',
        start: 'top 70%',
        end: 'bottom 80%',
        scrub: true
      },
      height: '100%',
      ease: 'none'
    });
  }

  // Items entrance
  const items = document.querySelectorAll('#timeline .timeline-item');
  items.forEach(item => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%'
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out'
    });
  });
}
