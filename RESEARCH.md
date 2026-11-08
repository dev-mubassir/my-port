# Creative Portfolio Research & Interaction Architecture

Ten high-end creative portfolio patterns sourced from Awwwards (SOTD), Godly, Siteinspire, Behance, and GSAP showcases. Adapted strictly to the 4-color editorial palette: Paper (`#DCDCDC`), Ink (`#0A0A0A`), Signal Orange-Red (`#FF4B2B`), and Backdrop Gray (`#8C8C8C`).

---

### 1. Shutter Counter Preloader (Awwwards SOTD Standard)
- **Concept:** High-impact entrance that establishes brand tone before rendering the DOM. A full-bleed Signal Orange canvas displays a rapid counter (`000` to `100`) set in tall condensed Anton type. Beside it, the name `mubassir.` types or glitches into place.
- **Reveal Transition:** Upon reaching 100%, an ink black curtain wipes upward, closely trailed by the light paper canvas, initiating the hero entrance timeline.
- **Palette adaptation:** Background `#FF4B2B`, numerals `#0A0A0A`, trailing wipe `#0A0A0A` and `#DCDCDC`.
- **Status:** **Adopted (Core Hero Preloader)**.

### 2. Velocity-Skewed Infinite Marquee (Godly / Studio Showcase)
- **Concept:** Infinite horizontal ticker for technical competencies. Rather than a static linear speed, the marquee hooks into the inertial scroll velocity provided by Lenis / GSAP ticker.
- **Kinetic Behavior:** When the user accelerates scroll down, the marquee speeds up proportionally and tilts with dynamic CSS `skewX()` (up to ±15deg). Scrolling up reverses the momentum.
- **Palette adaptation:** Ink typography on paper background, with orange accent tags and separator glyphs.
- **Status:** **Adopted (Skills Section 004)**.

### 3. Pure CSS Slice Glitch & Dual-Layer Flicker (Cyberpunk Brutalism)
- **Concept:** Digital distortion applied to the portrait cutout without heavy WebGL shaders or external canvas libraries. Slices are rendered using synchronized CSS `clip-path: polygon(...)` slices and stepped position jitter.
- **Channel Shift:** Zero cyan or magenta. Glitch displacement layers clone the image into ink (`#0A0A0A`) and signal orange (`#FF4B2B`) copies with `mix-blend-mode: multiply` and `screen` overlays.
- **Trigger:** Bursts fire randomly every 3–6 seconds, on cursor hover, and on initial load reveal.
- **Status:** **Adopted (Hero Portrait & Branding)**.

### 4. 3D Vertical Rotating Word / Kinetic Typography (Awwwards Best Practice)
- **Concept:** The terminal word in every major headline is mounted in a 3D perspective wrapper (`perspective: 600px`). At 2-second intervals, the word flips out on the X-axis (`rotateX(90deg)`) while the subsequent word flips in from `-90deg`.
- **Typographic Contrast:** Main headline in heavyweight Archivo or Syne ExtraBold; rotating word switches to elegant Instrument Serif Italic in Signal Orange (`#FF4B2B`). The container width animates dynamically to fit word bounding boxes without line-jumps.
- **Status:** **Adopted (5 Major Headlines)**.

### 5. Custom Trailing Cursor with Magnetic Snapping
- **Concept:** Native OS cursor is hidden on desktop pointer devices. Replaced with an active Signal Orange dot (`6px`) and an inertial trailing ring (`32px`, ink border) lerping via GSAP `quickTo`.
- **Magnetic Snap:** When cursor approaches interactive buttons or social pills within 50px, the element physically pulls toward the cursor position `(dx * 0.25, dy * 0.25)`.
- **Safety:** Automatically detects touch capability (`pointer: coarse`) and disables itself to avoid mobile anomalies.
- **Status:** **Adopted (Global Desktop UI)**.

### 6. Alphanumeric Text Scramble / Decoder (Minimal Editorial)
- **Concept:** Navigation links and micro-labels trigger a rapid cryptographic glyph scramble on hover before settling into legible text.
- **Implementation:** Custom vanilla JS scrambler cycling through uppercase characters `[A-Z0-9]` over 18 frames at 60fps, utilizing monospace type (`JetBrains Mono`).
- **Status:** **Adopted (Top Navigation & Index Numbers)**.

### 7. Interactive SVG Architecture Line-Drawing (Technical Case Study)
- **Concept:** Visualizing Siffty's multi-provider AI routing architecture (Client -> Fastify/Node -> AI Router -> Primary Cloudflare Workers AI / Fallback Gemini -> Prisma/Postgres).
- **Execution:** Vector paths animate via `stroke-dasharray` and `stroke-dashoffset` pinned or triggered by `ScrollTrigger`, with glowing ink/orange signal packets traveling along the nodes.
- **Status:** **Adopted (Siffty Case Study 002)**.

### 8. Typographic Project Card Diagonal Orange Wipe
- **Concept:** Clean monochromatic cards with brutalist rules that explode into color on hover. A solid Signal Orange background wipes across the card with `clip-path` or `transform: scaleY()`.
- **Interactive State:** Black typography inverts or contrasts against the orange wipe, project index nudges, and top-right arrow button rotates 45 degrees.
- **Status:** **Adopted (Projects Grid 003)**.

### 9. Endless Rotating Circular Text Badge
- **Concept:** Compact circular seal stamped on the hero section containing uppercase micro-text ("AVAILABLE FOR WORK • AI / ML • 2026 •") flowing continuously along an SVG `<circle>` path.
- **Execution:** Pure SVG `<textPath>` with infinite GSAP rotation (12s linear loop), adding speed acceleration on user scroll.
- **Status:** **Adopted (Hero Section Seal)**.

### 10. Curtain Mask & Staggered Split-Text Reveals
- **Concept:** Headlines and editorial sections do not merely fade in; each line or letter is wrapped inside an `overflow: hidden` mask. Words slide up from +100% Y with subtle rotation and stagger.
- **Status:** **Adopted (All Section Headlines & Numbers)**.
