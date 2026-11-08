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
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('#about .about-bio > *', {
    scrollTrigger: {
      trigger: '#about .about-bio',
      start: 'top 80%'
    },
    y: 25,
    opacity: 0,
    stagger: 0.1,
    duration: 0.6,
    ease: 'power2.out'
  });

  gsap.from('#about .fact-row', {
    scrollTrigger: {
      trigger: '#about .about-facts',
      start: 'top 80%'
    },
    x: 20,
    opacity: 0,
    stagger: 0.06,
    duration: 0.5,
    ease: 'power2.out'
  });

  // Proof cards reveal and number count-up
  const proofCards = document.querySelectorAll('#about .proof-card');
  if (proofCards.length) {
    gsap.from(proofCards, {
      scrollTrigger: {
        trigger: '#about .about-proof-grid',
        start: 'top 85%'
      },
      y: 35,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.out',
      onStart: () => {
        proofCards.forEach((card, index) => {
          const numEl = card.querySelector('.proof-num');
          if (!numEl) return;
          const target = index + 1;
          const counter = { val: 0 };
          gsap.to(counter, {
            val: target,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => {
              numEl.textContent = String(Math.ceil(counter.val)).padStart(2, '0');
            }
          });
        });
      }
    });
  }
}
