/**
 * Background Keep-Alive Job
 *
 * Runs every 7 minutes to keep cloud instances warm and prevent shutdown.
 * (Free tiers on platforms like Render, Koyeb, Glitch shut down after 15 minutes of inactivity).
 *
 * Usage:
 *   node scripts/keep-alive.js [optional-target-url]
 *
 * Environment variables:
 *   TARGET_URL / SITE_URL - Custom instance URL to keep alive
 *   INTERVAL_MINUTES       - Custom ping interval in minutes (default: 7)
 */

const INTERVAL_MINUTES = parseInt(process.env.INTERVAL_MINUTES || '7', 10);
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

// Resolve target URLs: CLI arguments > environment variables > defaults
const cliTargets = process.argv.slice(2);
const envTarget = process.env.TARGET_URL || process.env.SITE_URL;

const DEFAULT_TARGETS = [
  'https://gift-friend.vercel.app',
  'https://omeditor.in',
  'https://siffty.com',
  'https://dev-mubassir.github.io/my-port/'
];

const targets = cliTargets.length > 0 
  ? cliTargets 
  : envTarget 
    ? [envTarget] 
    : DEFAULT_TARGETS;

console.log('='.repeat(60));
console.log('⚡ Keep-Alive Background Service Active');
console.log(`⏱️  Schedule: Every ${INTERVAL_MINUTES} minutes (Shutdown prevention < 15 min threshold)`);
console.log('🎯 Target Endpoints:');
targets.forEach(t => console.log(`   - ${t}`));
console.log('='.repeat(60));

async function pingEndpoint(url) {
  const timestamp = new Date().toISOString();
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'KeepAlive-Bot/1.0 (+https://github.com/dev-mubassir)',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(12000)
    });
    const duration = Date.now() - startTime;

    if (response.ok) {
      console.log(`[${timestamp}] ✅ WARM | ${response.status} | ${duration}ms | ${url}`);
    } else {
      console.log(`[${timestamp}] ⚠️ ACTIVE | ${response.status} | ${duration}ms | ${url}`);
    }
  } catch (err) {
    console.error(`[${timestamp}] ❌ PING TIMEOUT/ERROR | ${url}: ${err.message}`);
  }
}

async function pingAll() {
  console.log(`\n[${new Date().toISOString()}] 🚀 Initiating keep-alive wake-up sequence...`);
  for (const url of targets) {
    await pingEndpoint(url);
  }
  console.log(`[${new Date().toISOString()}] ✨ Sequence finished. Next ping in ${INTERVAL_MINUTES} minutes.`);
}

// Immediate wake-up on start
pingAll();

// Background recurring interval every 7 minutes
setInterval(pingAll, INTERVAL_MS);
