import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHero() {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Infinite rotation for circular badge
  const badgeSvg = document.querySelector('.badge-svg');
  if (badgeSvg && !prefersReduced) {
    gsap.to(badgeSvg, {
      rotation: 360,
      ease: 'none',
      duration: 16,
      repeat: -1
    });
  }

  // Scroll down button
  const scrollBtn = document.querySelector('.hero-band-btn');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        aboutEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Hero Parallax on scroll
  if (!prefersReduced) {
    gsap.to('.hero-photo-wrapper', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      y: 80,
      ease: 'none'
    });

    gsap.to('.hero-orange-band', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      x: -40,
      ease: 'none'
    });
  }

  // Entrance timeline on portfolio ready
  window.addEventListener('portfolio:ready', () => {
    if (prefersReduced) return;

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.from('.site-header', {
      y: -40,
      opacity: 0,
      duration: 0.8
    })
    .from('.hero-micro-col', {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6
    }, '-=0.5')
    .from('.hero-headline', {
      y: 60,
      opacity: 0,
      duration: 0.9
    }, '-=0.4')
    .from('.hero-tagline', {
      y: 30,
      opacity: 0,
      duration: 0.7
    }, '-=0.5')
    .from('.hero-orange-band', {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 1.1,
      ease: 'expo.out'
    }, '-=0.7')
    .from('.hero-photo-wrapper', {
      opacity: 0,
      scale: 0.95,
      y: 30,
      duration: 0.9
    }, '-=0.6')
    .from(['.hero-index-001', '.hero-badge-wrapper', '.hero-vertical-meta', '.hero-band-btn'], {
      opacity: 0,
      duration: 0.6,
      stagger: 0.08
    }, '-=0.5');
  });
}
