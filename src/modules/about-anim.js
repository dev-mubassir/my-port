import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  splitTextForTyping,
  createCaret,
  triggerCaretFadeout,
  skipTypewriter,
  createTypewriterTimeline
} from './typewriter.js';

gsap.registerPlugin(ScrollTrigger);

// Re-export typewriter helpers for convenience
export {
  splitTextForTyping,
  createCaret,
  triggerCaretFadeout,
  skipTypewriter,
  createTypewriterTimeline
};

/**
 * Prepares the headline words and rotator container with overflow-hidden masks.
 * Ensures the 3D rotating word container continues to function uninterrupted.
 *
 * @param {HTMLElement} headlineEl
 * @returns {Object}
 */
function prepareHeadline(headlineEl) {
  if (!headlineEl || headlineEl._animPrepared) {
    return headlineEl?._animData || { words: [], masks: [], rotator: null, rotatorMask: null };
  }
  headlineEl._animPrepared = true;

  const textSpan =
    headlineEl.querySelector('span:not(.rotator-container):not(.rotator-word-box):not(.rotator-word)') ||
    headlineEl.firstElementChild;
  const rotator = headlineEl.querySelector('.rotator-container');

  const words = [];
  const masks = [];

  if (textSpan) {
    const rawWords = textSpan.textContent.trim().split(/\s+/);
    textSpan.innerHTML = '';
    rawWords.forEach((word, idx) => {
      const mask = document.createElement('span');
      mask.className = 'headline-mask';
      const wordSpan = document.createElement('span');
      wordSpan.className = 'headline-word';
      wordSpan.textContent = word;
      mask.appendChild(wordSpan);
      textSpan.appendChild(mask);
      words.push(wordSpan);
      masks.push(mask);

      if (idx < rawWords.length - 1) {
        textSpan.appendChild(document.createTextNode(' '));
      }
    });
  }

  let rotatorMask = null;
  if (rotator && rotator.parentNode) {
    rotatorMask = document.createElement('span');
    rotatorMask.className = 'headline-mask rotator-mask';
    rotator.parentNode.insertBefore(rotatorMask, rotator);
    rotatorMask.appendChild(rotator);
    masks.push(rotatorMask);
  }

  // Set initial position below mask
  gsap.set(words, { yPercent: 110 });
  if (rotator) {
    gsap.set(rotator, { yPercent: 110 });
  }

  const animData = { words, rotator, rotatorMask, masks };
  headlineEl._animData = animData;
  return animData;
}

/**
 * Prepares table borders into animated rules (scaleX: 0, origin: left center).
 *
 * @param {HTMLElement} tableEl
 * @returns {Object}
 */
function prepareTable(tableEl) {
  if (!tableEl || tableEl._animPrepared) {
    return tableEl?._animData || { allRules: [], labels: [], values: [] };
  }
  tableEl._animPrepared = true;
  tableEl.classList.add('anim-ready');

  let topRule = tableEl.querySelector('.about-facts-rule-top');
  if (!topRule) {
    topRule = document.createElement('div');
    topRule.className = 'about-facts-rule-top';
    topRule.setAttribute('aria-hidden', 'true');
    tableEl.prepend(topRule);
  }
  gsap.set(topRule, { scaleX: 0, transformOrigin: 'left center' });

  const rows = tableEl.querySelectorAll('.fact-row');
  const rowRules = [];
  rows.forEach(row => {
    let rule = row.querySelector('.fact-row-rule');
    if (!rule) {
      rule = document.createElement('div');
      rule.className = 'fact-row-rule';
      rule.setAttribute('aria-hidden', 'true');
      row.appendChild(rule);
    }
    gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' });
    rowRules.push(rule);
  });

  const labels = tableEl.querySelectorAll('.fact-label');
  const values = tableEl.querySelectorAll('.fact-value');

  gsap.set(labels, { opacity: 0 });

  const animData = {
    topRule,
    rowRules,
    allRules: [topRule, ...rowRules],
    labels,
    values
  };
  tableEl._animData = animData;
  return animData;
}

/**
 * Quick text scramble effect resolving character-for-character with zero CLS.
 * Uses characters strictly from the value's own text to preserve widths.
 *
 * @param {HTMLElement} el
 * @param {number} duration Scramble duration in seconds (0.4s to 0.7s)
 * @returns {Promise<void>}
 */
function scrambleFactValue(el, duration = 0.5) {
  const originalText = el.getAttribute('data-original-text') || el.textContent.trim();
  el.setAttribute('data-original-text', originalText);

  const pool = originalText
    .split('')
    .filter(c => c !== ' ' && c !== ',' && c !== '.' && c !== '-' && c !== '/' && c !== '—');

  if (pool.length === 0) return Promise.resolve();

  return new Promise(resolve => {
    const obj = { p: 0 };
    const tween = gsap.to(obj, {
      p: 1,
      duration,
      ease: 'power1.inOut',
      onUpdate: () => {
        const settledCount = Math.floor(obj.p * originalText.length);
        let out = originalText.slice(0, settledCount);
        for (let i = settledCount; i < originalText.length; i++) {
          const ch = originalText[i];
          if (ch === ' ' || ch === ',' || ch === '.' || ch === '-' || ch === '/' || ch === '—') {
            out += ch;
          } else {
            out += pool[Math.floor(Math.random() * pool.length)];
          }
        }
        el.textContent = out;
      },
      onComplete: () => {
        el.textContent = originalText;
        resolve();
      }
    });

    el._scrambleTween = tween;
    el._resolveScramble = () => {
      if (tween) tween.kill();
      el.textContent = originalText;
      resolve();
    };
  });
}

/**
 * Triggers scramble across all fact values.
 *
 * @param {NodeList|HTMLElement[]} values
 */
function runTableScramble(values) {
  values.forEach((valEl, idx) => {
    const duration = 0.45 + idx * 0.05; // 0.45s to 0.65s (within 0.4s-0.7s range)
    scrambleFactValue(valEl, duration);
  });
}

/**
 * Prepares proof cards initial positions and targets.
 *
 * @param {HTMLElement[]} cards
 */
function prepareProofCards(cards) {
  cards.forEach((card, idx) => {
    const numEl = card.querySelector('.proof-num');
    if (numEl) {
      const target = parseInt(numEl.getAttribute('data-count') || String(idx + 1), 10);
      numEl.setAttribute('data-target-num', String(target));
      numEl.textContent = '00';
    }
  });
  gsap.set(cards, { y: 30, opacity: 0 });
}

/**
 * Animates proof cards with staggered rise and metric count-up.
 *
 * @param {HTMLElement[]} cards
 * @param {gsap.core.Timeline} tl
 * @param {number|string} startTime
 */
function animateProofCards(cards, tl, startTime) {
  tl.to(
    cards,
    {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
      onStart: () => {
        cards.forEach((card, idx) => {
          const numEl = card.querySelector('.proof-num');
          if (!numEl) return;
          const target = parseInt(numEl.getAttribute('data-target-num') || String(idx + 1), 10);
          const obj = { val: 0 };
          const counterTween = gsap.to(obj, {
            val: target,
            duration: 1.0,
            ease: 'power2.out',
            onUpdate: () => {
              numEl.textContent = String(Math.round(obj.val)).padStart(2, '0');
            },
            onComplete: () => {
              numEl.textContent = String(target).padStart(2, '0');
            }
          });
          numEl._counterTween = counterTween;
        });
      }
    },
    startTime
  );
}

/**
 * Master initializer for About Section Animations.
 * Constructs and manages the full choreography sequence:
 * Headline -> Table Rules & 3D Art build-in -> Sequential Typing -> Proof Cards.
 *
 * @param {HTMLElement|string} [sectionEl='#about'] Target section element or selector
 * @param {Object} [options={}]
 * @param {Function} [options.onArtStart] Hook callback when 3D art should start building in
 * @param {Function} [options.onComplete] Callback when full choreography sequence finishes
 * @param {Function} [options.onTypingComplete] Callback when typing finishes
 * @param {string} [options.start='top 70%'] ScrollTrigger start boundary
 * @returns {{ timeline: gsap.core.Timeline|null, skip: Function, artBuildPromise: Promise<void>, destroy: Function }|null}
 */
export function initAboutAnimations(sectionEl = '#about', options = {}) {
  const section =
    typeof sectionEl === 'string' ? document.querySelector(sectionEl) : sectionEl;

  if (!section) return null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Promise hook for 3D art build-in
  let resolveArt;
  const artBuildPromise = new Promise(resolve => {
    resolveArt = resolve;
  });

  let artTriggered = false;
  function triggerArt() {
    if (artTriggered) return;
    artTriggered = true;
    if (typeof options.onArtStart === 'function') {
      try {
        options.onArtStart();
      } catch (err) {
        console.error('onArtStart error:', err);
      }
    }
    section.dispatchEvent(new CustomEvent('about:art-start', { bubbles: true }));
    if (resolveArt) {
      resolveArt();
      resolveArt = null;
    }
  }

  // 8. Reduced Motion: reveal all text, rules, and cards instantly without delay
  if (prefersReduced) {
    triggerArt();

    // Ensure proof cards show target values immediately
    const proofCards = section.querySelectorAll('.proof-card');
    proofCards.forEach((card, idx) => {
      const numEl = card.querySelector('.proof-num');
      if (numEl) {
        const target = parseInt(numEl.getAttribute('data-count') || String(idx + 1), 10);
        numEl.textContent = String(target).padStart(2, '0');
      }
    });

    return {
      timeline: null,
      artBuildPromise,
      skip: () => {},
      destroy: () => {}
    };
  }

  // Query section components
  const headlineEl = section.querySelector('.about-headline');
  const tableEl = section.querySelector('.about-facts');
  const bioLead = section.querySelector('.about-bio-lead');
  const bioPs = Array.from(section.querySelectorAll('.about-bio-p'));
  const proofCards = Array.from(section.querySelectorAll('.proof-card'));
  const bioContainer = section.querySelector('.about-bio');

  // Prepare components
  const headlineData = prepareHeadline(headlineEl);
  const tableData = prepareTable(tableEl);

  // Typewriter paragraphs preparation
  // Large paragraph (.about-bio-lead): typed at ~14ms per char
  // Two small mono paragraphs (.about-bio-p): typed faster at ~6ms per char
  // Total typing duration under 6 seconds
  const leadData = splitTextForTyping(bioLead);
  const pDataList = bioPs.map(p => splitTextForTyping(p));

  const caret = createCaret();
  const typewriterItems = [
    { chars: leadData.chars, charDelay: 0.014, element: bioLead },
    ...pDataList.map(pd => ({ chars: pd.chars, charDelay: 0.006, element: pd.element }))
  ];

  prepareProofCards(proofCards);

  // Master timeline with ScrollTrigger
  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: options.start || 'top 70%',
      toggleActions: 'play none none none',
      once: true
    },
    onComplete: () => {
      if (typeof options.onComplete === 'function') {
        options.onComplete();
      }
    }
  });

  // 1. Headline Animation: Words rise from overflow-hidden mask
  if (headlineData.words && headlineData.words.length) {
    masterTl.to(
      headlineData.words,
      {
        yPercent: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'expo.out'
      },
      0
    );
  }

  if (headlineData.rotator) {
    masterTl.to(
      headlineData.rotator,
      {
        yPercent: 0,
        duration: 0.9,
        ease: 'expo.out',
        onComplete: () => {
          if (headlineData.rotatorMask) {
            headlineData.rotatorMask.style.overflow = 'visible';
          }
          if (headlineData.masks) {
            headlineData.masks.forEach(m => {
              m.style.overflow = 'visible';
            });
          }
        }
      },
      0.24
    );
  }

  // 2. Table rules & 3D art build-in hook (parallel at ~0.6s)
  const tableStartTime = 0.6;
  masterTl.call(
    () => {
      triggerArt();
    },
    null,
    tableStartTime
  );

  if (tableData.allRules && tableData.allRules.length) {
    masterTl.to(
      tableData.allRules,
      {
        scaleX: 1,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out',
        transformOrigin: 'left center'
      },
      tableStartTime
    );
  }

  if (tableData.labels && tableData.labels.length) {
    masterTl.to(
      tableData.labels,
      {
        opacity: 1,
        duration: 0.45,
        stagger: 0.05,
        ease: 'power2.out'
      },
      tableStartTime + 0.1
    );
  }

  if (tableData.values && tableData.values.length) {
    masterTl.call(
      () => {
        runTableScramble(tableData.values);
      },
      null,
      tableStartTime + 0.15
    );
  }

  // 3. Typing animation starts at ~0.9s
  const typingStartTime = 0.9;
  const { timeline: typewriterTl, state: typewriterState } = createTypewriterTimeline(
    typewriterItems,
    {
      caret,
      onComplete: () => {
        if (typeof options.onTypingComplete === 'function') {
          options.onTypingComplete();
        }
      }
    }
  );

  masterTl.add(typewriterTl, typingStartTime);

  // 4. Proof cards reveal immediately after typing completes
  if (proofCards.length) {
    animateProofCards(proofCards, masterTl, '>');
  }

  // 5. User Skip Logic
  let isSkipped = false;
  function handleSkip() {
    if (isSkipped) return;
    isSkipped = true;

    cleanupListeners();
    triggerArt();

    // Immediately complete typing, reveal all chars, move caret to end, trigger fadeout
    skipTypewriter(typewriterState, 1.2);

    // Fast-forward master timeline
    if (masterTl.isActive()) {
      masterTl.progress(1);
    }

    // Ensure headline is resolved and masks visible
    if (headlineData.words) {
      headlineData.words.forEach(w => gsap.set(w, { yPercent: 0 }));
    }
    if (headlineData.rotator) {
      gsap.set(headlineData.rotator, { yPercent: 0 });
    }
    if (headlineData.masks) {
      headlineData.masks.forEach(m => {
        m.style.overflow = 'visible';
      });
    }
    if (headlineData.rotatorMask) {
      headlineData.rotatorMask.style.overflow = 'visible';
    }

    // Ensure table rules and labels are resolved
    if (tableData.allRules) {
      gsap.set(tableData.allRules, { scaleX: 1 });
    }
    if (tableData.labels) {
      gsap.set(tableData.labels, { opacity: 1 });
    }
    if (tableData.values) {
      tableData.values.forEach(valEl => {
        if (typeof valEl._resolveScramble === 'function') {
          valEl._resolveScramble();
        } else {
          const orig = valEl.getAttribute('data-original-text');
          if (orig) valEl.textContent = orig;
        }
      });
    }

    // Ensure proof cards are shown with target numbers
    proofCards.forEach((card, idx) => {
      gsap.set(card, { y: 0, opacity: 1 });
      const numEl = card.querySelector('.proof-num');
      if (numEl) {
        if (numEl._counterTween) numEl._counterTween.kill();
        const target = parseInt(numEl.getAttribute('data-target-num') || String(idx + 1), 10);
        numEl.textContent = String(target).padStart(2, '0');
      }
    });
  }

  // Event listeners for user skip: click, tap, keypress
  const onSectionClick = () => handleSkip();
  const onSectionTouch = () => handleSkip();
  section.addEventListener('click', onSectionClick, { passive: true });
  section.addEventListener('touchstart', onSectionTouch, { passive: true });

  const onKeyDown = () => {
    if (!isSkipped) {
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        handleSkip();
      }
    }
  };
  window.addEventListener('keydown', onKeyDown, { passive: true });

  // Scroll past paragraphs skip
  let scrollTriggerSkip = null;
  if (bioContainer) {
    scrollTriggerSkip = ScrollTrigger.create({
      trigger: bioContainer,
      start: 'bottom 40%',
      onEnter: () => handleSkip(),
      once: true
    });
  }

  function cleanupListeners() {
    section.removeEventListener('click', onSectionClick);
    section.removeEventListener('touchstart', onSectionTouch);
    window.removeEventListener('keydown', onKeyDown);
    if (scrollTriggerSkip) {
      scrollTriggerSkip.kill();
      scrollTriggerSkip = null;
    }
  }

  return {
    timeline: masterTl,
    skip: handleSkip,
    artBuildPromise,
    destroy: () => {
      cleanupListeners();
      masterTl.kill();
      if (typewriterTl) typewriterTl.kill();
    }
  };
}
