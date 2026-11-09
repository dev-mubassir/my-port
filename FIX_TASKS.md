# Fix Tasks (F01 - F06)

- [x] F01: HERO PHOTO DOES NOT FIT (desktop and mobile)
  - Re-cut photo from original `assets/mubassir-new.png` with highest quality, trim bounding box, remove halo (alpha threshold, erode 1px, feather 1px), no rectangular leftovers, export WebP with alpha: 1000px wide desktop (<200KB), 600px wide mobile (<120KB).
  - Use ONE photo element only. Make orange tint with an overlay of identical size, masked by cutout's alpha (`mask-image`), clipped to band rectangle, `mix-blend-mode: multiply`.
  - Outside band photo is grayscale high contrast. Glitch works on single photo.
  - Head fully above band top, shoulders/torso fully inside viewport, bottom edge on hero bottom edge.
  - Period after "Mubassir" always visible (if on orange band, render in ink).
  - "001" fully visible with 16px margin on desktop; smaller/fully visible or hidden on mobile.
  - Remove stray 1px line and ghost text in hero.
  - Mobile hero: one photo, aligned with band; face never covered by text; "Mubassir." scales without overflow; no gap > 24px; fits in 100svh (360x640 up to 412x915); arrow button and rotating badge never cover face; tagline readable.

- [x] F02: NAVBAR: BLACK ON 002, SEE-THROUGH, BROKEN ON MOBILE
  - Top-level sections and footer carry data-nav-theme. 002 Siffty is light. Inner dark blocks must never change nav theme. Detect section under nav bottom edge with IntersectionObserver / ScrollTrigger, also on load and resize.
  - Nav background 100% opaque in current theme color on all screen sizes, with 1px low-opacity rule. Theme transition 0.25s.
  - Mobile (<=768px): height 56px + safe-area-inset-top. Left: "+MS". Right: small orange HIRE ME button (36px high) and 3-dot menu button (44x44 tap area). Text links hidden (in menu overlay). Zero horizontal overflow.
  - Set scroll-padding-top and scroll-margin-top to nav height.
  - Playwright scroll sweep every 150px at 1440px and 360px: verify nav theme matches background under nav.

- [x] F03: PROJECTS: REAL SIFFTY DASHBOARD, LINKED TO THE LIVE SITE
  - Save uploaded Siffty dashboard to `assets/real/siffty/`.
  - Privacy blur: blur other people's names, handles, profile pictures, message text, email, phone numbers with sharp. Keep interface and metrics readable.
  - Optimize to WebP at 1600px and 800px (<150KB each), with width/height, srcset, lazy loading, alt "Siffty dashboard".
  - Link: image and "VISIT LIVE SITE" button open https://siffty.com in new tab. Add "LIVE" tag with slowly pulsing orange dot. Remove "Illustrative preview" caption.
  - Carousel with dots if multiple screenshots; fallback if none.

- [ ] F04: PROJECTS: CHANGE THE LIST
  - Final order: 01 Siffty, 02 DealRadar, 03 AegisChat (new), 04 CityKirana.
  - Remove Sky Jump completely: card, timeline, About, skills, README, content.js, JSON-LD, meta tags, and image files.
  - AegisChat: read repo `dev-mubassir/AegisChat`, write 2-sentence description and 3-5 stack tags based strictly on repo facts.
  - AegisChat card has "VIEW ON GITHUB ↗" button linking to repo.
  - Image: preview in palette (WebP 1600 and 800px, <120KB) with "Illustrative preview" caption.
  - Card numbers 01 to 04 with reveal animation.
  - Timeline: replace "2024 Shipped CityKirana & Sky Jump" with "Earlier: built CityKirana, a vanilla JavaScript grocery delivery site for Lakhnadon." (no year).

- [ ] F05: MOBILE RE-OPTIMISATION (whole site, top to bottom)
  - Global: headline letter-spacing no tighter than -0.02em, word-spacing ~0.1em on large headlines.
  - Zero horizontal scroll anywhere (Playwright check: bounding rect right <= window.innerWidth + 1px).
  - Remove floating "HIRE ME" pill on mobile (HIRE ME is in nav).
  - Minimum sizes: body 14px, mono 11px, tap targets 44px.
  - Remove big empty gaps; section padding 64 to 80px on mobile.
  - About: headline ends with rotating word: "Shipping real AI, one [ release / test / feature ]". Proof cards fit 2x2 grid without cutting off.
  - Siffty 002: auto-width tag (11px). Full-width stacked buttons (48px high). Dedicated vertical mobile layout for architecture diagram (stacked nodes joined by arrows, >=12px text, traveling packet, failure simulation working, no blank space). 2x2 metrics grid clamp(36px, 11vw, 56px).
  - Projects: 1 column, 16:10 images, tap targets.
  - Skills & How I Work: remove blank gap after heading underline. Fix copy: Step 01 "I use AI coding assistants to build faster, and I back every feature with automated tests.", Step 02 "Five automated test suites cover failover, data isolation, auto-reply and chat delete." Remove unsupported claims.
  - Journey: single vertical line running through center of dots; mobile: line at left edge, dots on line, year above title, content on remaining width. Keep UPCOMING item with pulsing dot.
  - Contact: clear button block: DOWNLOAD RESUME (full width, paper), EMAIL ME (full width, orange), COPY EMAIL / LINKEDIN / GITHUB 48px high outlined. No text wrapping inside buttons. Section label not hidden under nav.
  - Footer: Navigate and Connect side by side on mobile; Project below with real links only (siffty.com, @siffty.dev). Remove "Available worldwide..." and plain text items. Bottom bar: single-line copyright, BACK TO TOP ↑ aligned right.
  - Menu overlay: full screen, large links, 44px tap targets, touch restored.

- [ ] F06: FINAL MOBILE AND DESKTOP QA
  - Screenshots at 360x800 (DPR 3), 390x844, 412x915, 768x1024, 1280, 1440, 1920.
  - Overflow check empty list at every width.
  - Nav sweep: theme matches section below at every scroll step, opaque nav.
  - Hero: one photo, aligned, face uncovered, period visible, 001 visible.
  - Projects: Siffty, DealRadar, AegisChat, CityKirana; no Sky Jump anywhere.
  - Name audit: no visible lowercase "mubassir", no "AI Product Builder".
  - Color & font audit: 100% compliant.
  - Lighthouse: 90+ desktop, 80+ mobile, accessibility 90+. No console errors.
  - Git clean and pushed.

