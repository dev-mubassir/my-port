import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initProjects() {
  const section = document.getElementById('projects');
  if (!section) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  gsap.from('#projects .projects-headline', {
    scrollTrigger: {
      trigger: '#projects',
      start: 'top 75%'
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('#projects .project-card', {
    scrollTrigger: {
      trigger: '#projects .projects-grid',
      start: 'top 80%'
    },
    y: 60,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out'
  });
}
