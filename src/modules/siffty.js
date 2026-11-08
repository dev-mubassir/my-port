import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initArchitectureDiagram } from './diagram.js';

gsap.registerPlugin(ScrollTrigger);

export function initSiffty() {
  const section = document.getElementById('siffty');
  if (!section) return;

  initArchitectureDiagram();

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Stagger reveal on scroll
  gsap.from('#siffty .siffty-title-group > *', {
    scrollTrigger: {
      trigger: '#siffty',
      start: 'top 75%'
    },
    y: 40,
    opacity: 0,
    stagger: 0.1,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('#siffty .metric-card', {
    scrollTrigger: {
      trigger: '#siffty .siffty-metrics',
      start: 'top 80%'
    },
    y: 30,
    opacity: 0,
    stagger: 0.1,
    duration: 0.7,
    ease: 'power2.out'
  });
}
