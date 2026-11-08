import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NODE_DETAILS = {
  'node-ig-dm': {
    title: 'Instagram DM',
    desc: 'Incoming direct message sent by a creator or follower on Instagram.'
  },
  'node-webhook': {
    title: 'Meta Webhook (Instagram Graph API)',
    desc: 'Real-time HTTPS event notification dispatched securely by Meta servers.'
  },
  'node-express': {
    title: 'Express API Gateway (Node.js)',
    desc: 'Validates HMAC signatures, enforces schema boundaries, and isolates per-account data.'
  },
  'node-router': {
    title: 'AI Router',
    desc: 'Inspects task requirements, account quotas, and routes message to the right model.'
  },
  'node-cf-workers': {
    title: 'Primary: Cloudflare Workers AI',
    desc: 'Edge classification model delivering ~430ms median latency and low-cost triage.'
  },
  'node-gemini': {
    title: 'Fallback: Gemini',
    desc: 'Automatic multi-provider failover invoked immediately if edge inference times out.'
  },
  'node-text-gen': {
    title: 'Text Generation: gpt-oss-20b',
    desc: 'Specialized model for drafting contextual replies and creator response templates.'
  },
  'node-prisma': {
    title: 'Prisma ORM & PostgreSQL',
    desc: 'Stores categorized leads, isolated conversation threads, and audit logs (SQLite in dev).'
  },
  'node-socketio': {
    title: 'Socket.io Real-Time',
    desc: 'Pushes instant lead notifications and live status updates to connected browser clients.'
  },
  'node-nextjs': {
    title: 'Next.js Dashboard (React 19)',
    desc: 'High-performance creator interface for reviewing deals, filtering leads, and managing triage.'
  },
  'node-autoreply': {
    title: 'Auto-Reply via Graph API',
    desc: 'Dispatches confirmed replies back to the user via Meta Instagram Graph API.'
  }
};

export function initArchitectureDiagram() {
  const container = document.querySelector('.siffty-diagram-card');
  if (!container) return;

  const svg = container.querySelector('.architecture-svg');
  const simBtn = container.querySelector('.btn-simulate-failure');
  const detailTitle = container.querySelector('.popover-node-title');
  const detailDesc = container.querySelector('.popover-node-desc');
  const packet = container.querySelector('#active-packet');

  let isFailureMode = false;
  let isTabVisible = !document.hidden;
  let isInView = false;
  let packetTween = null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Paths
  const primaryPath = svg?.querySelector('#path-primary');
  const fallbackPath = svg?.querySelector('#path-fallback');

  function getActivePath() {
    return isFailureMode ? fallbackPath : primaryPath;
  }

  // Draw lines in on first scroll
  if (!prefersReduced && svg) {
    const drawLines = svg.querySelectorAll('.arch-connector');
    drawLines.forEach(line => {
      const length = line.getTotalLength ? line.getTotalLength() : 300;
      gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(line, {
        scrollTrigger: {
          trigger: container,
          start: 'top 80%'
        },
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power2.out'
      });
    });
  }

  // Animate packet along active path
  function startPacketAnimation() {
    if (prefersReduced || !packet) return;
    if (packetTween) packetTween.kill();

    const path = getActivePath();
    if (!path || !path.getTotalLength) return;

    const pathLength = path.getTotalLength();
    const tracker = { progress: 0 };

    packetTween = gsap.to(tracker, {
      progress: 1,
      duration: 3.2,
      repeat: -1,
      ease: 'none',
      onUpdate: () => {
        if (!isTabVisible || !isInView) return;
        const pt = path.getPointAtLength(tracker.progress * pathLength);
        packet.setAttribute('cx', pt.x);
        packet.setAttribute('cy', pt.y);
      }
    });
  }

  function updateVisualPath() {
    const cfNode = svg?.querySelector('#node-cf-workers');
    const geminiNode = svg?.querySelector('#node-gemini');

    if (isFailureMode) {
      primaryPath?.classList.remove('arch-connector--active');
      fallbackPath?.classList.add('arch-connector--active');
      cfNode?.classList.add('is-disabled');
      geminiNode?.classList.add('is-active');
      if (simBtn) {
        simBtn.textContent = 'Back to normal';
        simBtn.classList.add('is-active');
      }
    } else {
      primaryPath?.classList.add('arch-connector--active');
      fallbackPath?.classList.remove('arch-connector--active');
      cfNode?.classList.remove('is-disabled');
      geminiNode?.classList.remove('is-active');
      if (simBtn) {
        simBtn.textContent = 'Simulate primary model failure';
        simBtn.classList.remove('is-active');
      }
    }

    startPacketAnimation();
  }

  // Toggle simulate failure
  if (simBtn) {
    simBtn.addEventListener('click', () => {
      isFailureMode = !isFailureMode;
      updateVisualPath();
    });
  }

  // Node Interaction: hover / click / focus
  const nodes = container.querySelectorAll('.arch-node');
  nodes.forEach(node => {
    function activateNode() {
      const id = node.getAttribute('id');
      const data = NODE_DETAILS[id];
      if (data && detailTitle && detailDesc) {
        detailTitle.textContent = data.title;
        detailDesc.textContent = data.desc;
      }
    }

    node.addEventListener('mouseenter', activateNode);
    node.addEventListener('click', activateNode);
    node.addEventListener('focus', activateNode);
  });

  // IntersectionObserver to pause when off-screen
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      isInView = entry.isIntersecting;
      if (isInView && isTabVisible) {
        if (!packetTween) startPacketAnimation();
        else packetTween.play();
      } else {
        if (packetTween) packetTween.pause();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(container);

  // Tab visibility change
  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible && isInView) {
      if (packetTween) packetTween.play();
    } else {
      if (packetTween) packetTween.pause();
    }
  });

  // Initialize
  updateVisualPath();
}
