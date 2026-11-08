import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initMarquee } from './marquee.js';

gsap.registerPlugin(ScrollTrigger);

export function initSkills() {
  const section = document.getElementById('skills');
  if (!section) return;

  initMarquee();

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  gsap.from('#skills .skills-headline', {
    scrollTrigger: {
      trigger: '#skills',
      start: 'top 75%'
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('#skills .philosophy-card', {
    scrollTrigger: {
      trigger: '#skills .philosophy-grid',
      start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    stagger: 0.12,
    duration: 0.7,
    ease: 'power3.out'
  });
}
