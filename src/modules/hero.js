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

  // Set mask images on tint overlay
  const tint = document.querySelector('.hero-photo-orange-tint');
  if (tint) {
    const maskUrl = 'url("assets/mubassir-new-cutout.webp")';
    tint.style.webkitMaskImage = maskUrl;
    tint.style.maskImage = maskUrl;
  }

  // Function to sync orange tint clip-path with the orange band
  function syncBandClip() {
    const band = document.querySelector('.hero-orange-band');
    const tintEl = document.querySelector('.hero-photo-orange-tint');
    const photoWrapper = document.querySelector('.hero-photo-wrapper');
    if (!band || !tintEl || !photoWrapper) return;

    const bandRect = band.getBoundingClientRect();
    const photoRect = photoWrapper.getBoundingClientRect();

    if (photoRect.height === 0) return;

    const clipTop = Math.max(0, bandRect.top - photoRect.top);
    const clipBottom = Math.max(0, photoRect.bottom - bandRect.bottom);

    tintEl.style.clipPath = `inset(${Math.round(clipTop)}px 0px ${Math.round(clipBottom)}px 0px)`;
  }

  // Function to ensure the period after Mubassir is always visible
  // If it overlaps the orange band, render in ink (#0A0A0A); else signal orange (#FF4B2B)
  function updateDotColor() {
    const dot = document.querySelector('.hero-headline .dot');
    const band = document.querySelector('.hero-orange-band');
    if (!dot || !band) return;

    const dotRect = dot.getBoundingClientRect();
    const bandRect = band.getBoundingClientRect();

    const overlaps = (
      dotRect.bottom > bandRect.top &&
      dotRect.top < bandRect.bottom &&
      dotRect.right > bandRect.left &&
      dotRect.left < bandRect.right
    );

    if (overlaps) {
      dot.style.color = 'var(--color-ink)';
    } else {
      dot.style.color = 'var(--color-signal)';
    }
  }

  // Run on mount and attach listeners
  syncBandClip();
  updateDotColor();

  window.addEventListener('resize', () => {
    syncBandClip();
    updateDotColor();
  }, { passive: true });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      syncBandClip();
      updateDotColor();
    }, 100);
  });

  // Hero Parallax on scroll
  if (!prefersReduced) {
    gsap.to('.hero-photo-wrapper', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: () => {
          syncBandClip();
          updateDotColor();
        }
      },
      y: 60,
      ease: 'none'
    });

    gsap.to('.hero-orange-band', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: () => {
          syncBandClip();
          updateDotColor();
        }
      },
      x: -30,
      ease: 'none'
    });
  }

  // Entrance timeline on portfolio ready
  window.addEventListener('portfolio:ready', () => {
    syncBandClip();
    updateDotColor();

    if (prefersReduced) return;

    const tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
      onUpdate: () => {
        syncBandClip();
        updateDotColor();
      }
    });

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
