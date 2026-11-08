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
    y: 35,
    opacity: 0,
    stagger: 0.08,
    duration: 0.7,
    ease: 'power3.out'
  });

  // Metrics count-up animation
  const metrics = document.querySelectorAll('#siffty .metric-card');
  if (metrics.length) {
    ScrollTrigger.create({
      trigger: '#siffty .siffty-metrics',
      start: 'top 85%',
      once: true,
      onEnter: () => {
        // Metric 1: 99.6%
        const m1 = { val: 0 };
        const el1 = metrics[0]?.querySelector('.metric-num');
        if (el1) {
          gsap.to(m1, {
            val: 99.6,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: () => { el1.textContent = `${m1.val.toFixed(1)}%`; }
          });
        }

        // Metric 2: ~430ms
        const m2 = { val: 0 };
        const el2 = metrics[1]?.querySelector('.metric-num');
        if (el2) {
          gsap.to(m2, {
            val: 430,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: () => { el2.textContent = `~${Math.floor(m2.val)}ms`; }
          });
        }

        // Metric 3: 90%+
        const m3 = { val: 0 };
        const el3 = metrics[2]?.querySelector('.metric-num');
        if (el3) {
          gsap.to(m3, {
            val: 90,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: () => { el3.textContent = `${Math.floor(m3.val)}%+`; }
          });
        }

        // Metric 4: 5
        const m4 = { val: 0 };
        const el4 = metrics[3]?.querySelector('.metric-num');
        if (el4) {
          gsap.to(m4, {
            val: 5,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: () => { el4.textContent = String(Math.floor(m4.val)); }
          });
        }
      }
    });
  }
}
