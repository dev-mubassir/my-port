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

const html = `<!DOCTYPE html>
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
    height: 76px;
    border-bottom: 2px solid ${GRAY};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    background: ${INK};
  }
  .brand {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: ${PAPER};
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand span { color: ${SIGNAL}; }
  .shield-icon {
    width: 24px;
    height: 24px;
    stroke: ${SIGNAL};
    fill: none;
    stroke-width: 2.5;
  }
  .status-pill {
    display: flex;
    align-items: center;
    gap: 12px;
    background: ${INK};
    border: 1.5px solid ${GRAY};
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }
  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${SIGNAL};
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
  /* Left column: Sessions & Keys */
  .col-sessions {
    width: 380px;
    border-right: 1.5px solid ${GRAY};
    background: ${INK};
    display: flex;
    flex-direction: column;
  }
  .pane-header {
    padding: 16px 24px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: ${GRAY};
    border-bottom: 1px solid ${GRAY};
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
  }
  .session-card {
    padding: 20px 24px;
    border-bottom: 1px solid ${GRAY};
    background: ${INK};
  }
  .session-card.active {
    background: #181818;
    border-left: 4px solid ${SIGNAL};
  }
  .session-title {
    font-size: 15px;
    font-weight: 800;
    color: ${PAPER};
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
  }
  .session-sub {
    font-size: 12px;
    color: ${GRAY};
    margin-bottom: 8px;
  }
  .session-badge {
    display: inline-block;
    padding: 3px 8px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    border: 1px solid ${SIGNAL};
    color: ${SIGNAL};
  }
  /* Center column: Encrypted Relay Inspection */
  .col-relay {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 1.5px solid ${GRAY};
    background: ${INK};
  }
  .relay-content {
    flex: 1;
    padding: 28px 36px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
  }
  .packet-box {
    border: 1.5px solid ${GRAY};
    padding: 20px 24px;
    background: #141414;
  }
  .packet-header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: ${SIGNAL};
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px dashed ${GRAY};
  }
  .packet-code {
    font-size: 13px;
    line-height: 1.6;
    color: ${PAPER};
    word-break: break-all;
  }
  .cipher-hl {
    color: ${SIGNAL};
    font-weight: 700;
  }
  .packet-meta-row {
    margin-top: 12px;
    display: flex;
    gap: 16px;
    font-size: 11px;
    color: ${GRAY};
  }
  .meta-tag {
    padding: 2px 8px;
    border: 1px solid ${GRAY};
  }
  /* Right column: Zero-knowledge Verification */
  .col-guard {
    width: 440px;
    background: ${INK};
    display: flex;
    flex-direction: column;
  }
  .guard-content {
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .metric-card {
    border: 1.5px solid ${GRAY};
    padding: 20px 24px;
    background: #121212;
  }
  .metric-title {
    font-size: 11px;
    color: ${GRAY};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .metric-value {
    font-size: 24px;
    font-weight: 900;
    color: ${PAPER};
    margin-bottom: 6px;
  }
  .metric-val-hl {
    color: ${SIGNAL};
  }
  .metric-sub {
    font-size: 12px;
    color: ${GRAY};
    line-height: 1.5;
  }
  .checklist {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
  }
  .check-item {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: ${PAPER};
  }
  .check-icon {
    width: 14px;
    height: 14px;
    background: ${SIGNAL};
    color: ${INK};
    font-weight: 900;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <svg class="shield-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      AEGISCHAT <span>// E2EE MESSENGER</span>
    </div>
    <div class="status-pill">
      <div class="status-dot"></div>
      ZERO-KNOWLEDGE RELAY: ACTIVE
    </div>
    <div class="top-meta">FASTAPI + FLUTTER // HARDWARE-BACKED</div>
  </div>

  <div class="main-layout">
    <!-- Left Column: Keypairs & Identity -->
    <div class="col-sessions">
      <div class="pane-header">
        <span>SECURITY ENCLAVE</span>
        <span>STATUS</span>
      </div>
      <div class="session-card active">
        <div class="session-title">
          <span>PEER VERIFICATION</span>
          <span style="color: ${SIGNAL};">OK</span>
        </div>
        <div class="session-sub">Safety Number: 60-Digit Verified</div>
        <div class="session-badge">ED25519 SIGNED</div>
      </div>
      <div class="session-card">
        <div class="session-title">
          <span>LOCAL KEY STORE</span>
          <span style="color: ${GRAY};">LOCKED</span>
        </div>
        <div class="session-sub">Argon2id KDF + AES-256 Storage</div>
        <div class="session-badge" style="border-color: ${GRAY}; color: ${GRAY};">SECURE STORAGE</div>
      </div>
      <div class="session-card">
        <div class="session-title">
          <span>ANTI-SURVEILLANCE</span>
          <span style="color: ${SIGNAL};">ACTIVE</span>
        </div>
        <div class="session-sub">Screen capture protection enabled</div>
        <div class="session-badge">FLAG_SECURE ON</div>
      </div>
    </div>

    <!-- Center Column: Ciphertext Envelope Inspection -->
    <div class="col-relay">
      <div class="pane-header">
        <span>RELAY SERVER TELEMETRY (FASTAPI)</span>
        <span>OPAQUE ENVELOPE</span>
      </div>
      <div class="relay-content">
        <div class="packet-box">
          <div class="packet-header">
            <span>INBOUND WEBSOCKET FRAME [PACKET #0482]</span>
            <span>200 OK</span>
          </div>
          <div class="packet-code">
            {"envelope_id": "<span class="cipher-hl">9f8c12a7</span>", "type": "CIPHERTEXT",<br>
            "payload": "<span class="cipher-hl">7c4b18f0a3e9d82b...[480 BYTES ENCRYPTED]</span>",<br>
            "nonce": "e3a89012cdfa", "auth_tag": "2b09a1ff08de",<br>
            "key_wrap": "RSA-2048-OAEP-SHA256"}
          </div>
          <div class="packet-meta-row">
            <span class="meta-tag">CIPHER: AES-256-GCM</span>
            <span class="meta-tag">RELAY INSPECTION: 0% PLAINTEXT VISIBLE</span>
          </div>
        </div>

        <div class="packet-box">
          <div class="packet-header">
            <span>DELIVERY ACKNOWLEDGMENT & FLUSH</span>
            <span>ZERO RESIDUALS</span>
          </div>
          <div class="packet-code">
            &gt; Delivered to recipient socket ws://192.168.1.14:8000/ws/client_b<br>
            &gt; State: <span class="cipher-hl">IMMEDIATELY PURGED FROM RELAY MEMORY</span><br>
            &gt; Replay protection verified: timestamp within 1500ms jitter budget
          </div>
          <div class="packet-meta-row">
            <span class="meta-tag">DATABASE: ZERO-PLAINTEXT</span>
            <span class="meta-tag">LATENCY: 14ms</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Security Guarantees -->
    <div class="col-guard">
      <div class="pane-header">
        <span>SECURITY GUARANTEES</span>
        <span>HARDENED</span>
      </div>
      <div class="guard-content">
        <div class="metric-card">
          <div class="metric-title">ZERO-KNOWLEDGE RELAY</div>
          <div class="metric-value metric-val-hl">100% OPAQUE</div>
          <div class="metric-sub">Server never sees plaintext payloads, private keys, or contact address books.</div>
        </div>

        <div class="metric-card">
          <div class="metric-title">PROTOCOL GUARANTEES</div>
          <ul class="checklist">
            <li class="check-item"><span class="check-icon">&#10003;</span> AES-256-GCM authenticated cipher</li>
            <li class="check-item"><span class="check-icon">&#10003;</span> RSA-2048 OAEP ephemeral wrapping</li>
            <li class="check-item"><span class="check-icon">&#10003;</span> Ed25519 digital envelope signatures</li>
            <li class="check-item"><span class="check-icon">&#10003;</span> Argon2id PIN key derivation</li>
            <li class="check-item"><span class="check-icon">&#10003;</span> Out-of-band QR safety verification</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

async function generate() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.setContent(html);
  await page.waitForTimeout(300);

  const pngBuffer = await page.screenshot({ type: 'png' });
  await browser.close();

  // Desktop 1600x1000 WebP (< 120 KB)
  const webp1600 = await sharp(pngBuffer)
    .webp({ quality: 80, effort: 6 })
    .toBuffer();

  // Mobile 800x500 WebP (< 120 KB)
  const webp800 = await sharp(pngBuffer)
    .resize(800, 500)
    .webp({ quality: 78, effort: 6 })
    .toBuffer();

  fs.writeFileSync('assets/projects/aegischat-1600.webp', webp1600);
  fs.writeFileSync('assets/projects/aegischat-800.webp', webp800);

  console.log(`AegisChat 1600 WebP size: ${(webp1600.length / 1024).toFixed(1)} KB (target < 120 KB)`);
  console.log(`AegisChat 800 WebP size: ${(webp800.length / 1024).toFixed(1)} KB (target < 120 KB)`);
}

generate().catch(console.error);
