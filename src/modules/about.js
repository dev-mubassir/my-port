import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAbout() {
  const section = document.getElementById('about');
  if (!section) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Staggered reveal of about elements
  gsap.from('#about .about-headline', {
    scrollTrigger: {
      trigger: '#about',
      start: 'top 75%'
    },
    y: 50,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out'
  });

  gsap.from('#about .about-bio > *', {
    scrollTrigger: {
      trigger: '#about .about-bio',
      start: 'top 80%'
    },
    y: 30,
    opacity: 0,
    stagger: 0.12,
    duration: 0.7,
    ease: 'power2.out'
  });

  gsap.from('#about .fact-row', {
    scrollTrigger: {
      trigger: '#about .about-facts',
      start: 'top 80%'
    },
    x: 20,
    opacity: 0,
    stagger: 0.08,
    duration: 0.6,
    ease: 'power2.out'
  });

  gsap.from('#about .pillar-card', {
    scrollTrigger: {
      trigger: '#about .about-pillars',
      start: 'top 85%'
    },
    y: 40,
    opacity: 0,
    stagger: 0.12,
    duration: 0.7,
    ease: 'power3.out'
  });
}
