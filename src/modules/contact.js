import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initContact() {
  const section = document.getElementById('contact');
  if (!section) return;

  // Live IST Clock (14px font size compliant)
  const clockEl = document.getElementById('live-clock');
  function updateClock() {
    if (!clockEl) return;
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      clockEl.textContent = `${timeStr} IST`;
    } catch {
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const nd = new Date(utc + (3600000 * 5.5));
      clockEl.textContent = `${nd.toTimeString().split(' ')[0]} IST`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Back to top button
  const topBtns = document.querySelectorAll('.btn-back-to-top');
  topBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Copy email button with 2s feedback
  const copyBtn = document.getElementById('btn-copy-email');
  const copyText = document.getElementById('copy-email-text');
  let copyTimeout = null;

  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', async () => {
      const email = 'mubassirrr2005@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }

      copyText.textContent = 'Copied to clipboard!';
      copyBtn.style.borderColor = 'var(--color-signal)';
      copyBtn.style.color = 'var(--color-signal)';

      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copyText.textContent = 'Copy email';
        copyBtn.style.borderColor = '';
        copyBtn.style.color = '';
      }, 2000);
    });
  }

  // Quick Note Form Submission
  const form = document.getElementById('portfolio-contact-form');
  const statusEl = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.name?.value?.trim() || 'Visitor';
      const email = form.email?.value?.trim() || '';
      const message = form.message?.value?.trim() || '';

      if (!email || !message) {
        if (statusEl) statusEl.textContent = 'Please fill out your email and message.';
        return;
      }

      if (statusEl) statusEl.textContent = 'Opening your email client...';

      const subject = encodeURIComponent(`AI Engineer Opportunity / Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      const mailtoLink = `mailto:mubassirrr2005@gmail.com?subject=${subject}&body=${body}`;

      window.location.href = mailtoLink;

      setTimeout(() => {
        if (statusEl) statusEl.textContent = 'Drafted! You can also email directly at mubassirrr2005@gmail.com';
      }, 1200);
    });
  }

  // Mobile Floating "HIRE ME" Pill
  const mobilePill = document.getElementById('mobile-hire-pill');
  if (mobilePill) {
    const heroSection = document.getElementById('hero');
    const menuOverlay = document.getElementById('menu-overlay');

    function updatePillVisibility() {
      if (window.innerWidth > 768) {
        mobilePill.classList.remove('is-visible');
        return;
      }

      const scrollY = window.scrollY;
      const heroHeight = heroSection ? heroSection.offsetHeight : 600;
      const contactRect = section.getBoundingClientRect();
      const isContactInView = contactRect.top < window.innerHeight && contactRect.bottom > 0;
      const isMenuOpen = menuOverlay && menuOverlay.classList.contains('is-open');

      if (scrollY > heroHeight * 0.7 && !isContactInView && !isMenuOpen) {
        mobilePill.classList.add('is-visible');
      } else {
        mobilePill.classList.remove('is-visible');
      }
    }

    window.addEventListener('scroll', updatePillVisibility, { passive: true });
    window.addEventListener('resize', updatePillVisibility, { passive: true });

    mobilePill.addEventListener('click', e => {
      e.preventDefault();
      section.scrollIntoView({ behavior: 'smooth' });
    });

    updatePillVisibility();
  }

  // Scroll animations
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  gsap.from('#contact .contact-headline', {
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 75%'
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('#contact .recruiter-card', {
    scrollTrigger: {
      trigger: '#contact .recruiter-card',
      start: 'top 85%'
    },
    y: 30,
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out'
  });

  gsap.from('#contact .contact-actions-box', {
    scrollTrigger: {
      trigger: '#contact .contact-actions-box',
      start: 'top 85%'
    },
    y: 30,
    opacity: 0,
    duration: 0.7,
    delay: 0.1,
    ease: 'power2.out'
  });
}
