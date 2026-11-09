# Tasks: About Section Enhancements (H01 - H06)

- [x] **H01: 3D Art (`src/modules/art3d.js`, `src/styles/art3d.css`)**
  - Minimal rotating "neural map" sphere in wireframe using Canvas 2D and perspective projection (no Three.js, no WebGL).
  - Fibonacci sphere nodes (110 desktop, 64 mobile) with ~6% organic jitter. Connect to 3 nearest neighbours (~300 edges).
  - Depth-based ink opacity (8% to 50%), depth-scaled node dots. Batched draw calls for maximum 60fps performance.
  - Orange pulse packets travelling along random edges, thin orange orbit ring.
  - Entrance: scale out from centre with staggered ease, then fade in edges.
  - Desktop pointer tilt interaction (max 0.35 rad) and scroll spin decay; auto-rotate only on touch.
  - Theme-aware palette colors (`--color-ink`, `--color-signal`).
  - Performance: DPR capped at 2 (1.5 mobile), ResizeObserver, run rAF only while in view (IntersectionObserver) & tab visible. Static frame on prefers-reduced-motion.
  - Export `initArt3D(container, options) -> { play, pause, resize, destroy }`.

- [x] **H02: Type Effect and About Motion (`src/modules/typewriter.js`, `src/modules/about-anim.js`, `src/styles/about-anim.css`)**
  - Large paragraph typed at ~14ms/char; 2 small mono paragraphs typed at ~6ms/char. Total <6s.
  - Word wrap in nowrap inline-block spans, chars in inline spans with GSAP stagger (CLS = 0.0068, no mid-word breaking, accessible full text with aria-label/aria-hidden).
  - Caret: blinking orange block following last visible char, blinks 3s at end then smoothly fades out.
  - Trigger: ScrollTrigger start "top 70%" after headline reveal; click/tap/keypress/scroll skips to end.
  - Headline words rise from mask (expo.out). Rotating word ("release", "test", "feature") continues to rotate uninterrupted.
  - At-a-glance table: rule draw (scaleX), labels fade in, values resolve with in-place text scramble.
  - Proof cards staggered rise & count-up.
  - Single sequence timeline: `initAboutAnimations(sectionEl)`.

- [x] **H03: Background Music (`src/modules/audio.js`, `src/data/audio.js`, `src/styles/sound-toggle.css`, `assets/audio/`)**
  - Audio files loaded dynamically via hashed Vite import. User uploaded MP3 (`assets/audio/track-1.mp3`).
  - Loop configuration: restart from 0:00 and loop continuously (as requested in user prompt note).
  - Sound off by default. Zero audio network request until user taps sound toggle.
  - Fade in to VOLUME over 2s; fade out over 0.6s on toggle off. Pause on hidden tab, resume on visible if enabled.
  - LocalStorage choice persistence with try/catch.
  - Nav toggle UI: 44x44 icon button with 4-bar animated equalizer in signal orange.
  - On viewports <= 400px: hide in compact nav row and mirror toggle in menu overlay.
  - Web Audio API fallback loop if no audio tracks available.

- [x] **H04: Integration in About Section**
  - Desktop: 520px container behind right column, centered on at-a-glance table, z-index below text, contrast >= 4.5:1. Left column headline stays clear.
  - Mobile: clean container between headline and first paragraph (270px height in normal flow), no text overlap.
  - Sequence timeline: headline -> table rules & 3D art build-in -> typing -> proof cards.
  - Sound toggle integrated into nav (next to "HIRE ME") and menu overlay.
  - Existing rotator, nav theme, and menu overlay continue to work flawlessly.

- [x] **H05: Mobile Optimization & Responsive Verification**
  - Tested across 360x800, 390x844, 412x915, 768x1024, 1440x900, 1920x1080.
  - 64 nodes on mobile, DPR 1.5, tap targets >= 44px, zero horizontal overflow (`scrollWidth <= innerWidth`).
  - 3D art sits cleanly in flow with no text collision.

- [x] **H06: Final QA & Automated Verification**
  - Screenshots taken at all viewports in `test-results/about/`.
  - Motion delta verified (canvas pixel delta > 0).
  - Performance: rAF FPS counter >= 55 fps desktop (56.3 fps), CLS = 0.0068.
  - Audio verified: zero request before click, loops from 0:00, pauses on tab hide, localStorage persists.
  - Audits: 0 color violations, 0 font violations, 0 name/title violations, `npm run build` passes under budget.
  - Clean git tree, commits pushed to remote `origin/main`.
