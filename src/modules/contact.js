import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initContact() {
  const section = document.getElementById('contact');
  if (!section) return;

  // Live IST Clock
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
      // Fallback if timezone not supported
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const nd = new Date(utc + (3600000 * 5.5));
      clockEl.textContent = `${nd.toTimeString().split(' ')[0]} IST`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Back to top button
  const topBtn = document.querySelector('.btn-back-to-top');
  if (topBtn) {
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Contact Form Submission
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

      const subject = encodeURIComponent(`Inquiry from ${name} via Portfolio`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      const mailtoLink = `mailto:mubassirrr2005@gmail.com?subject=${subject}&body=${body}`;

      window.location.href = mailtoLink;

      setTimeout(() => {
        if (statusEl) statusEl.textContent = 'Message drafted! You can also email directly at mubassirrr2005@gmail.com';
      }, 1200);
    });
  }

  // Scroll animations
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  gsap.from('#contact .contact-headline', {
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 75%'
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('#contact .contact-grid > *', {
    scrollTrigger: {
      trigger: '#contact .contact-grid',
      start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    stagger: 0.15,
    duration: 0.7,
    ease: 'power2.out'
  });
}
