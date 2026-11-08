import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('assets/projects');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Strictly the 4 palette colors
const PAPER = '#DCDCDC';
const INK = '#0A0A0A';
const SIGNAL = '#FF4B2B';
const GRAY = '#8C8C8C';

const templates = [
  {
    id: 'siffty',
    width: 1600,
    height: 1000,
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1600px;
    height: 1000px;
    background: ${INK};
    color: ${PAPER};
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .topbar {
    height: 72px;
    border-bottom: 2px solid ${GRAY};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    background: #111111;
  }
  .brand {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: ${PAPER};
  }
  .brand span { color: ${SIGNAL}; }
  .model-pill {
    display: flex;
    align-items: center;
    gap: 12px;
    background: ${INK};
    border: 1.5px solid ${GRAY};
    padding: 8px 20px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.05em;
  }
  .model-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${SIGNAL};
    box-shadow: 0 0 10px ${SIGNAL};
  }
  .top-meta {
    font-size: 13px;
    color: ${GRAY};
    letter-spacing: 0.1em;
  }
  .main-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  .sidebar {
    width: 360px;
    border-right: 2px solid #222222;
    background: #0d0d0d;
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .counter-box {
    border: 1.5px solid ${GRAY};
    padding: 20px;
    background: ${INK};
  }
  .counter-num {
    font-size: 44px;
    font-weight: 900;
    color: ${SIGNAL};
    line-height: 1;
  }
  .counter-lbl {
    font-size: 11px;
    letter-spacing: 0.15em;
    color: ${GRAY};
    margin-top: 6px;
  }
  .filter-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .filter-item {
    padding: 12px 16px;
    font-size: 13px;
    border: 1px solid #222222;
    display: flex;
    justify-content: space-between;
    color: ${GRAY};
  }
  .filter-item.active {
    background: #181818;
    color: ${PAPER};
    border-left: 4px solid ${SIGNAL};
  }
  .chat-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 40px;
    background: ${INK};
    gap: 28px;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #222222;
    padding-bottom: 20px;
  }
  .user-badge {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .avatar {
    width: 48px;
    height: 48px;
    border: 2px solid ${SIGNAL};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    color: ${SIGNAL};
  }
  .intent-tag {
    background: ${SIGNAL};
    color: ${INK};
    font-weight: 900;
    padding: 6px 14px;
    font-size: 12px;
    letter-spacing: 0.08em;
  }
  .msg-card {
    border: 1.5px solid #333333;
    padding: 24px;
    background: #141414;
    max-width: 900px;
  }
  .msg-meta {
    font-size: 12px;
    color: ${GRAY};
    margin-bottom: 12px;
    display: flex;
    gap: 20px;
  }
  .msg-body {
    font-size: 17px;
    line-height: 1.6;
    color: ${PAPER};
  }
  .reply-card {
    border: 2px solid ${SIGNAL};
    padding: 28px;
    background: #181110;
    max-width: 900px;
    margin-left: 40px;
  }
  .reply-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }
  .reply-status {
    color: ${SIGNAL};
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
  }
  .reply-body {
    font-size: 16px;
    line-height: 1.6;
    color: ${PAPER};
  }
  .btn-row {
    display: flex;
    gap: 16px;
    margin-top: 20px;
  }
  .btn-action {
    background: ${SIGNAL};
    color: ${INK};
    font-weight: 900;
    padding: 10px 24px;
    border: none;
    font-size: 13px;
    letter-spacing: 0.05em;
  }
  .btn-secondary {
    background: transparent;
    border: 1px solid ${GRAY};
    color: ${PAPER};
    padding: 10px 20px;
    font-size: 13px;
  }
</style>
</head>
<body>
  <div class="topbar">
    <div class="brand">SIFFTY<span>.</span> // INSTAGRAM DM INTELLIGENCE</div>
    <div class="model-pill">
      <div class="model-dot"></div>
      <span>PRIMARY: CLOUDFLARE WORKERS AI · 430 ms</span>
    </div>
    <div class="top-meta">SYSTEM STATUS: 100% OPERATIONAL</div>
  </div>
  <div class="main-layout">
    <div class="sidebar">
      <div class="counter-box">
        <div class="counter-num">342</div>
        <div class="counter-lbl">DMs TRIAGED TODAY</div>
      </div>
      <div class="filter-list">
        <div class="filter-item active">
          <span>SPONSORSHIPS</span>
          <span style="color:${SIGNAL}; font-weight:900;">18</span>
        </div>
        <div class="filter-item">
          <span>HIGH INTENT LEADS</span>
          <span>42</span>
        </div>
        <div class="filter-item">
          <span>GENERAL SUPPORT</span>
          <span>120</span>
        </div>
        <div class="filter-item">
          <span>SPAM FILTERED</span>
          <span>162</span>
        </div>
      </div>
    </div>
    <div class="chat-view">
      <div class="chat-header">
        <div class="user-badge">
          <div class="avatar">VP</div>
          <div>
            <div style="font-size:18px; font-weight:700;">@venture_partner</div>
            <div style="font-size:12px; color:${GRAY};">Verified Creator Partner · 480k followers</div>
          </div>
        </div>
        <div class="intent-tag">SPONSORSHIP DETECTED · EST $1,200</div>
      </div>
      <div class="msg-card">
        <div class="msg-meta">
          <span>INCOMING VIA META GRAPH API</span>
          <span>TODAY 14:28:02</span>
        </div>
        <div class="msg-body">
          "Hey Mubassir, our marketing lead loved your latest video on Siffty's architecture. We are scaling our Q4 AI developer tools campaign and want to book a dedicated feature reel. Let us know your rates and deck."
        </div>
      </div>
      <div class="reply-card">
        <div class="reply-head">
          <div class="reply-status">AUTOPILOT DRAFT // WORKERS AI (gpt-oss-20b)</div>
          <div style="font-size:12px; color:${GRAY};">CONFIDENCE SCORE: 97.8%</div>
        </div>
        <div class="reply-body">
          "Hi Team! Thanks for reaching out. Siffty's creator media kit and Q4 sponsorship rates for AI technical deep-dives are attached. Mubassir's calendar link: cal.com/mubassir. Looking forward to collaborating!"
        </div>
        <div class="btn-row">
          <button class="btn-action">APPROVE & SEND (META API)</button>
          <button class="btn-secondary">RE-GENERATE VIA GEMINI</button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'dealradar',
    width: 1600,
    height: 1000,
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1600px;
    height: 1000px;
    background: ${INK};
    color: ${PAPER};
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    display: flex;
    flex-direction: column;
    padding: 50px 70px;
    gap: 36px;
    overflow: hidden;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid ${GRAY};
    padding-bottom: 24px;
  }
  .title {
    font-size: 38px;
    font-weight: 900;
    letter-spacing: -0.03em;
  }
  .title span { color: ${SIGNAL}; }
  .stats-bar {
    display: flex;
    gap: 30px;
  }
  .stat-pill {
    border: 1.5px solid ${GRAY};
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 700;
    background: #141414;
  }
  .stat-pill.highlight {
    border-color: ${SIGNAL};
    color: ${SIGNAL};
  }
  .filter-row {
    display: flex;
    gap: 16px;
  }
  .pill {
    padding: 8px 18px;
    font-size: 13px;
    border: 1px solid #333;
    color: ${GRAY};
  }
  .pill.active {
    background: ${PAPER};
    color: ${INK};
    font-weight: 700;
  }
  .feed-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    flex: 1;
  }
  .deal-card {
    border: 1.5px solid #282828;
    background: #111111;
    padding: 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .deal-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .deal-source {
    font-size: 12px;
    color: ${GRAY};
    letter-spacing: 0.1em;
  }
  .deal-val {
    font-size: 28px;
    font-weight: 900;
    color: ${SIGNAL};
  }
  .deal-company {
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 12px;
  }
  .deal-desc {
    font-size: 14px;
    line-height: 1.6;
    color: ${GRAY};
    margin-bottom: 24px;
  }
  .deal-meta-strip {
    font-size: 11px;
    color: ${GRAY};
    border-top: 1px dashed #333;
    padding-top: 14px;
    margin-bottom: 20px;
  }
  .btn-save {
    background: ${SIGNAL};
    color: ${INK};
    font-weight: 900;
    padding: 12px 20px;
    text-align: center;
    font-size: 13px;
    border: none;
    letter-spacing: 0.05em;
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div style="font-size:12px; letter-spacing:0.2em; color:${GRAY}; margin-bottom:8px;">AI UTILITY // EMAIL & DM DETECTOR</div>
      <div class="title">DealRadar<span>.</span></div>
    </div>
    <div class="stats-bar">
      <div class="stat-pill highlight">FOUND 12 DEALS IN 4 M</div>
      <div class="stat-pill">PIPELINE: $14,800</div>
      <div class="stat-pill">PARSER: FASTAPI + REGEX</div>
    </div>
  </div>
  <div class="filter-row">
    <div class="pill active">ALL TRACKED INBOUNDS (12)</div>
    <div class="pill">CONFIRMED BUDGETS (8)</div>
    <div class="pill">HIGH CONFIDENCE (10)</div>
    <div class="pill">ARCHIVED</div>
  </div>
  <div class="feed-grid">
    <div class="deal-card">
      <div>
        <div class="deal-top">
          <span class="deal-source">GMAIL INBOUND #104</span>
          <span class="deal-val">$3,200</span>
        </div>
        <div class="deal-company">Acme Cloud AI</div>
        <div class="deal-desc">
          "Identified intent: 1x YouTube mid-roll sponsorship + 2x X technical threads showcasing API migration."
        </div>
        <div class="deal-meta-strip">MATCHED: [budget, deliverable, rate_card]</div>
      </div>
      <button class="btn-save">SAVE TO PIPELINE</button>
    </div>
    <div class="deal-card">
      <div>
        <div class="deal-top">
          <span class="deal-source">X DM STREAM #089</span>
          <span class="deal-val">$2,400</span>
        </div>
        <div class="deal-company">VectorDB Labs</div>
        <div class="deal-desc">
          "Identified intent: Technical deep dive tutorial on embedding pipelines and low latency query indexing."
        </div>
        <div class="deal-meta-strip">MATCHED: [sponsored_tutorial, dev_outreach]</div>
      </div>
      <button class="btn-save">SAVE TO PIPELINE</button>
    </div>
    <div class="deal-card">
      <div>
        <div class="deal-top">
          <span class="deal-source">LINKEDIN MSG #042</span>
          <span class="deal-val">$1,800</span>
        </div>
        <div class="deal-company">Agentic Tools Inc</div>
        <div class="deal-desc">
          "Identified intent: Keynote guest speaker or hands-on agent workshop for junior engineers."
        </div>
        <div class="deal-meta-strip">MATCHED: [workshop, speaker_fee, retainer]</div>
      </div>
      <button class="btn-save">SAVE TO PIPELINE</button>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'citykirana',
    width: 1600,
    height: 1000,
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1600px;
    height: 1000px;
    background: ${PAPER};
    color: ${INK};
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .banner {
    background: ${SIGNAL};
    color: ${INK};
    padding: 14px 40px;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.1em;
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid ${INK};
  }
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 60px;
    border-bottom: 2px solid ${INK};
    background: ${PAPER};
  }
  .logo {
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -0.03em;
  }
  .search-box {
    border: 2px solid ${INK};
    padding: 12px 30px;
    width: 500px;
    font-size: 14px;
    color: ${GRAY};
    background: #FFFFFF;
  }
  .cart-pill {
    border: 2px solid ${INK};
    background: ${INK};
    color: ${PAPER};
    padding: 12px 24px;
    font-weight: 800;
    font-size: 14px;
  }
  .cat-bar {
    display: flex;
    padding: 16px 60px;
    gap: 30px;
    border-bottom: 1px solid ${GRAY};
    font-size: 13px;
    font-weight: 700;
  }
  .cat-item.active {
    color: ${SIGNAL};
    text-decoration: underline;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
    padding: 40px 60px;
    flex: 1;
  }
  .prod-card {
    border: 2px solid ${INK};
    background: #FFFFFF;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .prod-thumb {
    height: 180px;
    border: 1px dashed ${GRAY};
    background: ${PAPER};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    font-size: 12px;
    color: ${GRAY};
  }
  .prod-name {
    font-size: 17px;
    font-weight: 800;
    margin-bottom: 8px;
    line-height: 1.3;
  }
  .prod-weight {
    font-size: 12px;
    color: ${GRAY};
    margin-bottom: 16px;
  }
  .prod-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #EEEEEE;
    padding-top: 14px;
  }
  .prod-price {
    font-size: 26px;
    font-weight: 900;
    color: ${INK};
  }
  .btn-add {
    background: ${INK};
    color: ${PAPER};
    border: none;
    font-weight: 900;
    padding: 10px 18px;
    font-size: 12px;
    letter-spacing: 0.05em;
  }
</style>
</head>
<body>
  <div class="banner">
    <span>DELIVERING IN 30 MINS · LAKHNADON EXPRESS</span>
    <span>ZERO FRAMEWORK · VANILLA JS · INSTANT 3G LOAD</span>
  </div>
  <div class="nav">
    <div class="logo">CITYKIRANA</div>
    <div class="search-box">Search daily staples, dairy, spices...</div>
    <div class="cart-pill">CART (3 ITEMS) · ₹461</div>
  </div>
  <div class="cat-bar">
    <div class="cat-item active">DAILY STAPLES</div>
    <div class="cat-item">FRESH DAIRY</div>
    <div class="cat-item">SPICES & OILS</div>
    <div class="cat-item">SNACKS & BEVERAGES</div>
    <div class="cat-item">HOUSEHOLD ESSENTIALS</div>
  </div>
  <div class="grid">
    <div class="prod-card">
      <div>
        <div class="prod-thumb">PREMIUM STAPLE</div>
        <div class="prod-name">Sharbati Whole Wheat Atta</div>
        <div class="prod-weight">5 KG BAG · 100% WHOLE GRAIN</div>
      </div>
      <div class="prod-bottom">
        <div class="prod-price">₹285</div>
        <button class="btn-add">ADD TO CART</button>
      </div>
    </div>
    <div class="prod-card">
      <div>
        <div class="prod-thumb">FRESH DAIRY</div>
        <div class="prod-name">Local Farm Pasteurized Milk</div>
        <div class="prod-weight">1 LITER · CHILLED DELIVERY</div>
      </div>
      <div class="prod-bottom">
        <div class="prod-price">₹66</div>
        <button class="btn-add">ADD TO CART</button>
      </div>
    </div>
    <div class="prod-card">
      <div>
        <div class="prod-thumb">COLD PRESSED</div>
        <div class="prod-name">Traditional Mustard Oil</div>
        <div class="prod-weight">1 LITER BOTTLE · PURE KACHI GHANI</div>
      </div>
      <div class="prod-bottom">
        <div class="prod-price">₹175</div>
        <button class="btn-add">ADD TO CART</button>
      </div>
    </div>
    <div class="prod-card">
      <div>
        <div class="prod-thumb">AROMATIC RICE</div>
        <div class="prod-name">Select Daawat Basmati Rice</div>
        <div class="prod-weight">1 KG POUCH · AGED GRAIN</div>
      </div>
      <div class="prod-bottom">
        <div class="prod-price">₹110</div>
        <button class="btn-add">ADD TO CART</button>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'skyjump',
    width: 1600,
    height: 1000,
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1600px;
    height: 1000px;
    background: ${INK};
    color: ${PAPER};
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    display: flex;
    flex-direction: column;
    padding: 40px;
    overflow: hidden;
  }
  .hud {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid ${GRAY};
    padding-bottom: 20px;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 0.1em;
  }
  .hud-score { color: ${SIGNAL}; font-size: 28px; }
  .canvas-stage {
    flex: 1;
    position: relative;
    border: 2px solid ${GRAY};
    margin: 30px 0;
    background: #0d0d0d;
    background-image: linear-gradient(${GRAY} 1px, transparent 1px), linear-gradient(90deg, ${GRAY} 1px, transparent 1px);
    background-size: 50px 50px;
    background-color: #070707;
  }
  .platform {
    position: absolute;
    height: 14px;
    background: ${PAPER};
    border: 2px solid ${INK};
    box-shadow: 0 4px 0 ${GRAY};
  }
  .platform.spring {
    background: ${SIGNAL};
    box-shadow: 0 4px 0 #900000;
  }
  .player {
    position: absolute;
    width: 44px;
    height: 44px;
    background: ${PAPER};
    border: 3px solid ${INK};
    box-shadow: 0 0 20px ${SIGNAL};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .trail {
    position: absolute;
    background: ${SIGNAL};
    opacity: 0.7;
  }
  .game-footer {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: ${GRAY};
    letter-spacing: 0.15em;
  }
</style>
</head>
<body>
  <div class="hud">
    <div>GAME // SKY JUMP ARCADE</div>
    <div>SCORE: <span class="hud-score">04280</span></div>
    <div>LEVEL: <span style="color:${SIGNAL};">03</span></div>
    <div>VELOCITY: +18.4 px/f</div>
    <div>PHYSICS: 60 FPS</div>
  </div>
  <div class="canvas-stage">
    <!-- Platforms -->
    <div class="platform" style="bottom: 120px; left: 300px; width: 220px;"></div>
    <div class="platform spring" style="bottom: 260px; left: 620px; width: 180px;"></div>
    <div class="platform" style="bottom: 420px; left: 950px; width: 240px;"></div>
    <div class="platform" style="bottom: 580px; left: 550px; width: 200px;"></div>
    <div class="platform" style="bottom: 740px; left: 220px; width: 190px;"></div>
    <div class="platform spring" style="bottom: 860px; left: 700px; width: 220px;"></div>

    <!-- Particle Trail -->
    <div class="trail" style="bottom: 440px; left: 600px; width: 8px; height: 30px; opacity: 0.2;"></div>
    <div class="trail" style="bottom: 470px; left: 605px; width: 12px; height: 35px; opacity: 0.5;"></div>
    <div class="trail" style="bottom: 510px; left: 610px; width: 16px; height: 40px; opacity: 0.8;"></div>

    <!-- Player Character -->
    <div class="player" style="bottom: 560px; left: 602px;">
      <div style="width: 14px; height: 14px; background: ${SIGNAL};"></div>
    </div>
  </div>
  <div class="game-footer">
    <span>ENGINE: VANILLA JS CANVAS API</span>
    <span>ZERO EXTERNAL LIBS</span>
    <span>PROCEDURAL GENERATION</span>
    <span>HIGH SCORE: 18450</span>
  </div>
</body>
</html>`
  },
  {
    id: 'og-image',
    width: 1200,
    height: 630,
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    background: ${PAPER};
    color: ${INK};
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px 80px;
    position: relative;
    overflow: hidden;
  }
  .frame {
    position: absolute;
    inset: 20px;
    border: 2px solid ${GRAY};
    pointer-events: none;
  }
  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 14px;
    letter-spacing: 0.15em;
    font-weight: 700;
  }
  .mark {
    font-size: 24px;
    font-weight: 900;
  }
  .main-block {
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 2;
  }
  .headline {
    font-size: 104px;
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: -0.04em;
  }
  .headline span { color: ${SIGNAL}; }
  .subtitle {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: ${INK};
    margin-top: 8px;
  }
  .tech-pills {
    display: flex;
    gap: 12px;
    margin-top: 14px;
  }
  .tech-pill {
    background: ${INK};
    color: ${PAPER};
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
  }
  .orange-band {
    position: absolute;
    right: 0;
    bottom: 80px;
    width: 380px;
    height: 180px;
    background: ${SIGNAL};
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    font-weight: 900;
    color: ${INK};
    letter-spacing: -0.02em;
  }
  .bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1.5px solid ${INK};
    padding-top: 20px;
    font-size: 13px;
    letter-spacing: 0.1em;
    z-index: 2;
  }
</style>
</head>
<body>
  <div class="frame"></div>
  <div class="top-row">
    <div class="mark">+MS</div>
    <div>MUBASSIR SHAH — AI ENGINEER — PORTFOLIO 2026</div>
    <div>dev-mubassir</div>
  </div>
  <div class="main-block">
    <div class="headline">Mubassir<span>.</span></div>
    <div class="subtitle">AI Engineer · Siffty Creator</div>
    <div class="tech-pills">
      <div class="tech-pill">PYTHON</div>
      <div class="tech-pill">FASTAPI</div>
      <div class="tech-pill">WORKERS AI</div>
      <div class="tech-pill">GEMINI</div>
      <div class="tech-pill">NEXT.JS</div>
      <div class="tech-pill">VANILLA JS</div>
    </div>
  </div>
  <div class="orange-band">SIFFTY</div>
  <div class="bottom-row">
    <div>https://dev-mubassir.github.io/my-port</div>
    <div>OPEN TO AI ENGINEER ROLES · 2026</div>
  </div>
</body>
</html>`
  }
];

async function generate() {
  console.log('Launching browser to render project images...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const t of templates) {
    console.log(`Rendering ${t.id} (${t.width}x${t.height})...`);
    await page.setViewportSize({ width: t.width, height: t.height });
    await page.setContent(t.html, { waitUntil: 'load' });
    const buffer = await page.screenshot({ type: 'png' });

    if (t.id === 'og-image') {
      // Save 1200x630 webp & png
      const webpPath = path.resolve('assets/og-image.webp');
      const pngPath = path.resolve('assets/og-image.png');
      await sharp(buffer).webp({ quality: 85 }).toFile(webpPath);
      await sharp(buffer).png({ quality: 90 }).toFile(pngPath);
      const stat = fs.statSync(webpPath);
      console.log(`Saved og-image.webp (${Math.round(stat.size / 1024)} KB)`);
    } else {
      // S1-S4: 1600px desktop (<120 KB) and 800px mobile (<60 KB)
      const p1600 = path.join(outDir, `${t.id}-1600.webp`);
      const p800 = path.join(outDir, `${t.id}-800.webp`);

      await sharp(buffer)
        .resize(1600, 1000)
        .webp({ quality: 82 })
        .toFile(p1600);

      await sharp(buffer)
        .resize(800, 500)
        .webp({ quality: 80 })
        .toFile(p800);

      const stat1600 = fs.statSync(p1600);
      const stat800 = fs.statSync(p800);
      console.log(`Saved ${t.id}-1600.webp (${Math.round(stat1600.size / 1024)} KB) and ${t.id}-800.webp (${Math.round(stat800.size / 1024)} KB)`);
    }
  }

  await browser.close();
  console.log('All project images successfully generated!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});

