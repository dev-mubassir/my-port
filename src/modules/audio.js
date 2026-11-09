/**
 * Audio Engine & Sound Controller for Mubassir Shah Portfolio.
 * 
 * Manages background audio playback, HTMLAudioElement with volume fading,
 * Web Audio API ambient fallback, localStorage persistence, visibility pausing,
 * and accessible animated sound toggle buttons.
 */

import { audioConfig } from '../data/audio.js';
import '../styles/sound-toggle.css';

// Audio engine state
let isPlaying = false;
let audioElement = null;
let currentTrackIndex = 0;
let isUsingFallback = false;
let fallbackSynth = null;
let fadeAnimationId = null;
let pausedDueToVisibility = false;
let isControllerInitialized = false;

// Set of all registered toggle buttons in DOM
const registeredButtons = new Set();

// One-time interaction listener trackers (starts audio on first gesture if autoplay policy blocks initial unmuted play)
const INTERACTION_EVENTS = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown', 'wheel'];
let interactionBound = false;

/* ==========================================================================
   LocalStorage Helpers (Wrapped in try/catch)
   ========================================================================== */

function getStoredPreference() {
  try {
    return localStorage.getItem(audioConfig.STORAGE_KEY);
  } catch (err) {
    return null;
  }
}

function setStoredPreference(val) {
  try {
    localStorage.setItem(audioConfig.STORAGE_KEY, val);
  } catch (err) {}
}

function getStoredTooltipShown() {
  try {
    return localStorage.getItem(audioConfig.TOOLTIP_STORAGE_KEY) === 'true';
  } catch (err) {
    return true;
  }
}

function setStoredTooltipShown() {
  try {
    localStorage.setItem(audioConfig.TOOLTIP_STORAGE_KEY, 'true');
  } catch (err) {}
}

/* ==========================================================================
   Volume Control & Fading (Safe for iOS Safari)
   ========================================================================== */

function safeSetVolume(val) {
  if (!audioElement) return;
  try {
    const clamped = Math.max(0, Math.min(1, val));
    audioElement.volume = clamped;
  } catch (err) {
    // iOS Safari ignores volume adjustments or throws in strict contexts
  }
}

function fadeInVolume(target = audioConfig.VOLUME, durationSec = audioConfig.FADE_SECONDS) {
  if (fadeAnimationId) cancelAnimationFrame(fadeAnimationId);
  if (!audioElement) return;

  let startVolume = 0;
  try {
    startVolume = Number.isFinite(audioElement.volume) ? audioElement.volume : 0;
  } catch (e) {}

  const startTime = performance.now();
  const durationMs = durationSec * 1000;

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const newVol = startVolume + (target - startVolume) * progress;
    safeSetVolume(newVol);

    if (progress < 1 && isPlaying) {
      fadeAnimationId = requestAnimationFrame(tick);
    } else {
      fadeAnimationId = null;
      if (isPlaying) {
        safeSetVolume(target);
      }
    }
  }

  fadeAnimationId = requestAnimationFrame(tick);
}

function fadeOutVolume(durationSec = audioConfig.FADE_OUT_SECONDS, onComplete) {
  if (fadeAnimationId) cancelAnimationFrame(fadeAnimationId);
  if (!audioElement) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  let startVolume = audioConfig.VOLUME;
  try {
    startVolume = Number.isFinite(audioElement.volume) ? audioElement.volume : audioConfig.VOLUME;
  } catch (e) {}

  const startTime = performance.now();
  const durationMs = durationSec * 1000;

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const newVol = Math.max(0, startVolume * (1 - progress));
    safeSetVolume(newVol);

    if (progress < 1 && !isPlaying) {
      fadeAnimationId = requestAnimationFrame(tick);
    } else {
      fadeAnimationId = null;
      if (!isPlaying && audioElement) {
        try {
          audioElement.pause();
        } catch (e) {}
        safeSetVolume(0);
      }
      if (typeof onComplete === 'function') onComplete();
    }
  }

  fadeAnimationId = requestAnimationFrame(tick);
}

/* ==========================================================================
   Web Audio API Ambient Synthesizer Fallback
   Two detuned triangle oscillators through gentle low-pass filter (cutoff 400Hz)
   with soft pentatonic harmonic tones and slow breathing gain LFO.
   Gain = 0 when off; ramps to 0.12 when on.
   ========================================================================== */

class AmbientSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.osc1 = null;
    this.osc2 = null;
    this.filter = null;
    this.lfo = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      this.ctx = new AudioContextClass();

      // Master Gain: 0 when off, ramps to 0.12 when on
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

      // Filter: gentle low-pass filter (cutoff ~400Hz)
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      // Soft pentatonic harmonic tones:
      // Osc 1: D3 (146.83 Hz), detuned -4 cents
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'triangle';
      this.osc1.frequency.setValueAtTime(146.83, this.ctx.currentTime);
      this.osc1.detune.setValueAtTime(-4, this.ctx.currentTime);

      // Osc 2: A3 (220.00 Hz - harmonic fifth), detuned +4 cents
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(220.00, this.ctx.currentTime);
      this.osc2.detune.setValueAtTime(4, this.ctx.currentTime);

      // Slow breathing gain LFO (sine wave at 0.14 Hz ~7.1s cycle)
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(0.14, this.ctx.currentTime);

      const lfoDepth = this.ctx.createGain();
      lfoDepth.gain.setValueAtTime(0.2, this.ctx.currentTime);

      const breathingNode = this.ctx.createGain();
      breathingNode.gain.setValueAtTime(0.8, this.ctx.currentTime);

      this.lfo.connect(lfoDepth);
      lfoDepth.connect(breathingNode.gain);

      // Graph: Oscs -> Low-pass Filter -> Breathing Node -> Master Gain -> Destination
      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      this.filter.connect(breathingNode);
      breathingNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.osc1.start();
      this.osc2.start();
      this.lfo.start();

      this.initialized = true;
    } catch (err) {
      console.warn('[audio] Web Audio API synth initialization failed:', err);
    }
  }

  play() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    // Ramp to 0.12 over FADE_SECONDS
    this.masterGain.gain.linearRampToValueAtTime(0.12, now + audioConfig.FADE_SECONDS);
  }

  pause() {
    if (!this.ctx || !this.masterGain || !this.initialized) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    // Ramp to 0 over FADE_OUT_SECONDS
    this.masterGain.gain.linearRampToValueAtTime(0, now + audioConfig.FADE_OUT_SECONDS);
  }
}

function getFallbackSynth() {
  if (!fallbackSynth) {
    fallbackSynth = new AmbientSynth();
  }
  return fallbackSynth;
}

function handleAudioError(err) {
  console.warn('[audio] Audio element failed, activating Web Audio API ambient fallback:', err);
  isUsingFallback = true;
  if (audioElement) {
    try {
      audioElement.pause();
    } catch (e) {}
  }
  if (isPlaying) {
    getFallbackSynth().play();
  }
}

/* ==========================================================================
   Playback & Looping Logic
   Note: User explicitly specified: Music restarts from 0:00 then runs in loop!
   ========================================================================== */

function handleTrackEnded() {
  if (!isPlaying || !audioElement) return;

  const tracks = audioConfig.tracks || [];
  if (tracks.length > 1) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } while (nextIndex === currentTrackIndex && tracks.length > 1);

    currentTrackIndex = nextIndex;
    audioElement.src = tracks[currentTrackIndex];
  }

  try {
    audioElement.currentTime = audioConfig.START_AT_SECONDS; // 0:00
  } catch (e) {}

  const playPromise = audioElement.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.warn('[audio] Loop track playback failed:', err);
    });
  }
}

function startAudio() {
  if (isPlaying) return;
  isPlaying = true;
  pausedDueToVisibility = false;
  setStoredPreference('on');
  updateAllButtons();

  if (isUsingFallback) {
    getFallbackSynth().play();
    return;
  }

  // Create Audio object on demand (ZERO network request before user interaction)
  if (!audioElement) {
    const tracks = (audioConfig.tracks && audioConfig.tracks.length > 0)
      ? audioConfig.tracks
      : ['assets/audio/track-1.mp3'];

    if (!tracks || tracks.length === 0) {
      isUsingFallback = true;
      getFallbackSynth().play();
      return;
    }

    try {
      audioElement = new Audio();
      audioElement.preload = 'auto';
      currentTrackIndex = 0;
      audioElement.src = tracks[currentTrackIndex];
      if (typeof window !== 'undefined') {
        window._mubassirAudio = audioElement;
      }

      audioElement.addEventListener('ended', handleTrackEnded);
      audioElement.addEventListener('error', handleAudioError);
    } catch (err) {
      console.warn('[audio] Audio element creation failed, activating fallback synth:', err);
      isUsingFallback = true;
      getFallbackSynth().play();
      return;
    }
  }

  // Set volume = 0, start track from START_AT_SECONDS (36s per user requirement), call .play(), fade volume up to VOLUME over FADE_SECONDS
  safeSetVolume(0);
  const targetStart = audioConfig.START_AT_SECONDS || 0;
  if (targetStart > 0 && (!audioElement.currentTime || audioElement.currentTime < 1)) {
    if (audioElement.readyState >= 1) {
      try {
        audioElement.currentTime = targetStart;
      } catch (e) {}
    } else {
      audioElement.addEventListener(
        'loadedmetadata',
        () => {
          try {
            audioElement.currentTime = targetStart;
          } catch (e) {}
        },
        { once: true }
      );
    }
  }

  const playPromise = audioElement.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        if (targetStart > 0 && audioElement.currentTime < targetStart - 1) {
          try {
            audioElement.currentTime = targetStart;
          } catch (e) {}
        }
        fadeInVolume(audioConfig.VOLUME, audioConfig.FADE_SECONDS);
      })
      .catch((err) => {
        console.warn('[audio] Audio playback error:', err);
        if (err.name === 'NotSupportedError' || (audioElement && audioElement.error)) {
          handleAudioError(err);
        } else {
          // Autoplay policy or gesture required before unmuted audio can play
          isPlaying = false;
          updateAllButtons();
          setupInteractionListeners();
        }
      });
  }
}

function stopAudio() {
  if (!isPlaying) return;
  isPlaying = false;
  pausedDueToVisibility = false;
  setStoredPreference('off');
  updateAllButtons();

  if (isUsingFallback) {
    if (fallbackSynth) fallbackSynth.pause();
    return;
  }

  if (audioElement) {
    // Fade volume to 0 over 0.6s, then pause
    fadeOutVolume(audioConfig.FADE_OUT_SECONDS);
  }
}

export function toggleSound() {
  cleanupInteractionListeners();
  if (isPlaying) {
    stopAudio();
  } else {
    startAudio();
  }
}

export function getSoundState() {
  const currentVol = isUsingFallback
    ? (isPlaying ? 0.12 : 0)
    : (audioElement ? audioElement.volume : (isPlaying ? audioConfig.VOLUME : 0));

  const tracks = audioConfig.tracks || [];
  const currentTrack = tracks[currentTrackIndex] || null;

  return {
    isPlaying,
    volume: currentVol,
    startAtSeconds: audioConfig.START_AT_SECONDS,
    isFallback: isUsingFallback,
    currentTrack
  };
}

/* ==========================================================================
   UI Synchronization & Button Factory
   ========================================================================== */

function updateAllButtons() {
  const label = isPlaying ? 'Background music: on' : 'Background music: off';
  const pressed = isPlaying ? 'true' : 'false';

  registeredButtons.forEach((btn) => {
    if (document.body && !document.body.contains(btn)) {
      registeredButtons.delete(btn);
      return;
    }
    if (isPlaying) {
      btn.classList.add('is-playing');
    } else {
      btn.classList.remove('is-playing');
    }
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-pressed', pressed);
  });
}

export function createSoundToggleButton(options = {}) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `btn-sound-toggle ${options.className || ''}`.trim();
  if (options.id) btn.id = options.id;

  btn.setAttribute('aria-label', isPlaying ? 'Background music: on' : 'Background music: off');
  btn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
  btn.setAttribute('data-magnetic', '');

  if (isPlaying) {
    btn.classList.add('is-playing');
  }

  // 4-bar equalizer icon container
  const eqIcon = document.createElement('span');
  eqIcon.className = 'equalizer-icon';
  eqIcon.setAttribute('aria-hidden', 'true');

  for (let i = 1; i <= 4; i++) {
    const bar = document.createElement('span');
    bar.className = `sound-bar sound-bar--${i}`;
    eqIcon.appendChild(bar);
  }
  btn.appendChild(eqIcon);

  if (options.includeLabel) {
    const textSpan = document.createElement('span');
    textSpan.className = 'sound-toggle-text';
    textSpan.textContent = options.labelText || 'SOUND';
    btn.appendChild(textSpan);
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSound();
  });

  registeredButtons.add(btn);
  return btn;
}

/* ==========================================================================
   Tooltip & First-Visit Visual Prompt
   ========================================================================== */

function setupTooltip(btn) {
  if (getStoredTooltipShown() || isPlaying) return;

  function triggerTooltip() {
    if (getStoredTooltipShown() || isPlaying) return;
    setStoredTooltipShown();

    btn.classList.add('has-pulse');
    btn.addEventListener('animationend', () => {
      btn.classList.remove('has-pulse');
    }, { once: true });

    let tooltip = btn.querySelector('.sound-toggle-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('span');
      tooltip.className = 'sound-toggle-tooltip';
      tooltip.setAttribute('role', 'tooltip');
      tooltip.textContent = 'Sound off. Tap for music.';
      btn.appendChild(tooltip);
    }

    requestAnimationFrame(() => {
      tooltip.classList.add('is-visible');
    });

    let dismissed = false;
    function dismissTooltip() {
      if (dismissed) return;
      dismissed = true;
      btn.classList.remove('has-pulse');
      if (tooltip) {
        tooltip.classList.remove('is-visible');
        setTimeout(() => {
          if (tooltip && tooltip.parentNode) {
            tooltip.remove();
          }
        }, 350);
      }
    }

    const timer = setTimeout(dismissTooltip, 5000);

    btn.addEventListener('click', () => {
      clearTimeout(timer);
      dismissTooltip();
    }, { once: true });
  }

  const preloader = document.getElementById('preloader');
  const isLoaderDone = !preloader || preloader.style.display === 'none' || window.__PORTFOLIO_READY__;

  if (isLoaderDone) {
    setTimeout(triggerTooltip, 800);
  } else {
    window.addEventListener('portfolio:ready', () => {
      setTimeout(triggerTooltip, 400);
    }, { once: true });
  }
}

/* ==========================================================================
   Interaction Listeners (For Restoring Stored 'on' State on 1st Gesture)
   ========================================================================== */

function onFirstInteraction(e) {
  cleanupInteractionListeners();

  // If clicked directly on sound toggle button, toggleSound() handles it
  const target = e.target;
  if (target && target.closest && target.closest('.btn-sound-toggle')) {
    return;
  }

  const savedPref = getStoredPreference();
  if (savedPref !== 'off' && !isPlaying) {
    startAudio();
  }
}

function setupInteractionListeners() {
  if (interactionBound) return;
  interactionBound = true;
  INTERACTION_EVENTS.forEach((evt) => {
    window.addEventListener(evt, onFirstInteraction, { capture: true, once: true });
  });
}

function cleanupInteractionListeners() {
  if (!interactionBound) return;
  interactionBound = false;
  INTERACTION_EVENTS.forEach((evt) => {
    window.removeEventListener(evt, onFirstInteraction, { capture: true });
  });
}

/* ==========================================================================
   Page Visibility Handling (Auto-pause tab background)
   ========================================================================== */

let visibilityBound = false;

function setupVisibilityListener() {
  if (visibilityBound) return;
  visibilityBound = true;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (isPlaying) {
        pausedDueToVisibility = true;
        if (isUsingFallback && fallbackSynth) {
          fallbackSynth.pause();
        } else if (audioElement) {
          try {
            audioElement.pause();
          } catch (e) {}
        }
      }
    } else {
      if (pausedDueToVisibility && getStoredPreference() === 'on') {
        pausedDueToVisibility = false;
        if (isUsingFallback && fallbackSynth) {
          fallbackSynth.play();
        } else if (audioElement) {
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn('[audio] Resume on visibility change failed:', err);
            });
          }
        }
      }
    }
  });
}

/* ==========================================================================
   Main Controller Initialization
   ========================================================================== */

export function initAudioController() {
  if (isControllerInitialized) return;
  isControllerInitialized = true;

  // 1. Scan and register any existing .btn-sound-toggle elements in the DOM
  const existingButtons = document.querySelectorAll('.btn-sound-toggle');
  existingButtons.forEach((btn) => {
    registeredButtons.add(btn);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSound();
    });
    btn.setAttribute('aria-label', isPlaying ? 'Background music: on' : 'Background music: off');
    btn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
  });

  // 2. If no toggle button in .site-header .nav-right, mount one cleanly
  const navRight = document.querySelector('.site-header .nav-right');
  let primaryNavBtn = navRight ? navRight.querySelector('.btn-sound-toggle') : null;

  if (navRight && !primaryNavBtn) {
    primaryNavBtn = createSoundToggleButton({ className: 'btn-sound-toggle--nav' });
    const dotsBtn = navRight.querySelector('.btn-menu-dots');
    if (dotsBtn) {
      navRight.insertBefore(primaryNavBtn, dotsBtn);
    } else {
      navRight.appendChild(primaryNavBtn);
    }
  }

  // 3. Mount toggle button into mobile menu overlay (.menu-sound-row) if overlay exists
  const menuOverlay = document.getElementById('menu-overlay');
  if (menuOverlay) {
    let menuSoundRow = menuOverlay.querySelector('.menu-sound-row');
    if (!menuSoundRow) {
      const menuFooter = menuOverlay.querySelector('.menu-footer');
      if (menuFooter) {
        menuSoundRow = document.createElement('div');
        menuSoundRow.className = 'menu-sound-row';

        const label = document.createElement('span');
        label.className = 'menu-sound-label';
        label.textContent = 'SOUND AMBIENCE';

        const menuBtn = createSoundToggleButton({ className: 'btn-sound-toggle--menu' });
        menuSoundRow.appendChild(label);
        menuSoundRow.appendChild(menuBtn);

        menuFooter.parentNode.insertBefore(menuSoundRow, menuFooter);
      }
    } else if (!menuSoundRow.querySelector('.btn-sound-toggle')) {
      const menuBtn = createSoundToggleButton({ className: 'btn-sound-toggle--menu' });
      menuSoundRow.appendChild(menuBtn);
    }
  }

  // 4. Auto-start on website open:
  // User requested: "auto start music when we open the website and music start from 36 sec"
  const savedPref = getStoredPreference();
  if (savedPref !== 'off') {
    startAudio();
    if (!isPlaying) {
      setupInteractionListeners();
    }
  } else if (primaryNavBtn) {
    setupTooltip(primaryNavBtn);
  }

  // 5. Visibility change handling
  setupVisibilityListener();
}
