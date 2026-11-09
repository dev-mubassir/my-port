import gsap from 'gsap';

/**
 * Typewriter module for Mubassir Shah's portfolio (Task H02)
 *
 * Requirements:
 * - Word wrap in nowrap inline-block spans, chars in inline spans with GSAP stagger
 * - Zero layout shift (CLS = 0), natural text layout preserved from the start
 * - Accessibility: full text stored in aria-label, split spans marked aria-hidden="true"
 * - Blinking block caret moving dynamically after latest revealed character
 * - Caret blinks 3s at end then smoothly fades out
 * - User skip support (immediate full reveal, caret to end, fadeout)
 */

/**
 * Splits an element's text content into accessible word and character spans.
 *
 * Markup Wrapping & Zero CLS:
 * - Each word: <span class="type-word" style="display: inline-block; white-space: nowrap;">
 * - Each character: <span class="type-char" style="opacity: 0;">${char}</span>
 * - Preserve existing spaces as: <span class="type-space"> </span>
 * - Accessibility: keeps original text in aria-label on the paragraph,
 *   and sets aria-hidden="true" on the split text wrapper.
 *
 * @param {HTMLElement} element
 * @returns {{ element: HTMLElement, wrapper: HTMLElement, words: HTMLElement[], chars: HTMLElement[], text: string }}
 */
export function splitTextForTyping(element) {
  if (!element) {
    return { element: null, wrapper: null, words: [], chars: [], text: '' };
  }

  // If already split, return existing structure
  if (element._typewriterData) {
    return element._typewriterData;
  }

  const rawText = element.textContent || '';
  const cleanText = rawText.trim().replace(/\s+/g, ' ');

  // Keep original text accessible to screen readers and SEO crawlers
  element.setAttribute('aria-label', cleanText);

  // Clear existing content and append aria-hidden wrapper
  element.textContent = '';
  const wrapper = document.createElement('span');
  wrapper.className = 'type-content';
  wrapper.setAttribute('aria-hidden', 'true');

  const words = cleanText.split(' ');
  const wordSpans = [];
  const charSpans = [];

  words.forEach((wordText, wordIndex) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'type-word';
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';

    for (const char of wordText) {
      const charSpan = document.createElement('span');
      charSpan.className = 'type-char';
      charSpan.style.opacity = '0';
      charSpan.textContent = char;
      wordSpan.appendChild(charSpan);
      charSpans.push(charSpan);
    }

    wrapper.appendChild(wordSpan);
    wordSpans.push(wordSpan);

    if (wordIndex < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.className = 'type-space';
      spaceSpan.textContent = ' ';
      wrapper.appendChild(spaceSpan);
    }
  });

  element.appendChild(wrapper);

  const data = {
    element,
    wrapper,
    words: wordSpans,
    chars: charSpans,
    text: cleanText
  };

  element._typewriterData = data;
  return data;
}

/**
 * Creates the blinking orange block caret element.
 * Styled in about-anim.css with background: var(--color-signal),
 * width: 0.55em, height: 1.15em, display: inline-block, vertical-align: -0.15em.
 *
 * @returns {HTMLElement}
 */
export function createCaret() {
  const caret = document.createElement('span');
  caret.className = 'type-caret is-blinking';
  caret.setAttribute('aria-hidden', 'true');
  return caret;
}

/**
 * Triggers smooth fadeout of the caret after a specified delay.
 *
 * @param {HTMLElement} caret
 * @param {number} delaySeconds Delay before fadeout begins (default 3 seconds)
 */
export function triggerCaretFadeout(caret, delaySeconds = 3) {
  if (!caret) return;
  if (caret._fadeTimeout) clearTimeout(caret._fadeTimeout);

  caret._fadeTimeout = setTimeout(() => {
    caret.classList.remove('is-blinking');
    caret.classList.add('is-fading');
    gsap.to(caret, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        if (caret.parentNode) {
          caret.parentNode.removeChild(caret);
        }
      }
    });
  }, delaySeconds * 1000);
}

/**
 * Immediately completes typing: reveals all characters, moves caret to end,
 * and triggers caret fadeout.
 *
 * @param {Object} state Typewriter state object
 * @param {number} [fadeDelaySeconds=1.0] Delay before caret fades out on skip
 */
export function skipTypewriter(state, fadeDelaySeconds = 1.0) {
  if (!state || state.isFinished) return;
  state.isFinished = true;

  if (state.timeline && state.timeline.isActive()) {
    state.timeline.pause();
  }

  // Reveal all characters across all configured paragraphs
  if (Array.isArray(state.allChars)) {
    state.allChars.forEach(char => {
      char.style.opacity = '1';
    });
  }

  // Move caret after the very last character
  if (state.allChars && state.allChars.length > 0 && state.caret) {
    const lastChar = state.allChars[state.allChars.length - 1];
    if (lastChar && lastChar.parentNode) {
      lastChar.after(state.caret);
      state.caret.classList.add('is-blinking');
      triggerCaretFadeout(state.caret, fadeDelaySeconds);
    }
  }

  if (typeof state.onComplete === 'function') {
    state.onComplete();
  }
}

/**
 * Builds a GSAP timeline that types multiple paragraphs sequentially.
 *
 * @param {Array<{ chars: HTMLElement[], charDelay: number, element?: HTMLElement }>} items
 * @param {Object} options
 * @param {HTMLElement} [options.caret]
 * @param {Function} [options.onComplete]
 * @returns {{ timeline: gsap.core.Timeline, state: Object }}
 */
export function createTypewriterTimeline(items, options = {}) {
  const caret = options.caret || createCaret();
  const allChars = [];
  items.forEach(it => {
    if (it.chars) allChars.push(...it.chars);
  });

  const state = {
    allChars,
    caret,
    isFinished: false,
    timeline: null,
    onComplete: options.onComplete
  };

  const tl = gsap.timeline({
    onComplete: () => {
      if (!state.isFinished) {
        state.isFinished = true;
        // When typing completes naturally: blinks for 3s then smoothly fades out
        triggerCaretFadeout(caret, 3.0);
        if (typeof options.onComplete === 'function') {
          options.onComplete();
        }
      }
    }
  });

  state.timeline = tl;

  // Place caret initially before the first character of the first word
  if (items[0] && items[0].chars && items[0].chars[0]) {
    const firstChar = items[0].chars[0];
    if (firstChar.parentNode) {
      firstChar.parentNode.prepend(caret);
    }
  }

  items.forEach(item => {
    const { chars, charDelay = 0.014 } = item;
    if (!chars || chars.length === 0) return;

    let lastIndex = -1;

    tl.to(chars, {
      opacity: 1,
      duration: 0.0001,
      stagger: charDelay,
      ease: 'none',
      onStart: () => {
        if (chars[0] && chars[0].parentNode) {
          chars[0].after(caret);
          caret.classList.add('is-blinking');
        }
      },
      onUpdate: function () {
        const p = this.progress();
        const idx = Math.min(chars.length - 1, Math.floor(p * chars.length));
        if (idx > lastIndex && chars[idx]) {
          chars[idx].after(caret);
          lastIndex = idx;
        }
      }
    });
  });

  return { timeline: tl, state };
}
