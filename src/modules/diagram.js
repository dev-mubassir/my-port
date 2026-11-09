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

  const svgDesktop = container.querySelector('.architecture-svg');
  const svgMobile = container.querySelector('.architecture-svg-mobile');
  const simBtn = container.querySelector('.btn-simulate-failure');
  const detailTitle = container.querySelector('.popover-node-title');
  const detailDesc = container.querySelector('.popover-node-desc');
  const packetDesktop = container.querySelector('#active-packet');
  const packetMobile = container.querySelector('#active-packet-mobile');

  let isFailureMode = false;
  let isTabVisible = !document.hidden;
  let isInView = false;
  let packetTweenDesktop = null;
  let packetTweenMobile = null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Paths Desktop
  const primaryPathD = svgDesktop?.querySelector('#path-primary');
  const fallbackPathD = svgDesktop?.querySelector('#path-fallback');

  // Paths Mobile
  const primaryPathM = svgMobile?.querySelector('#path-primary-mobile');
  const fallbackPathM = svgMobile?.querySelector('#path-fallback-mobile');

  function getActiveDesktopPath() {
    return isFailureMode ? fallbackPathD : primaryPathD;
  }

  function getActiveMobilePath() {
    return isFailureMode ? fallbackPathM : primaryPathM;
  }

  // Draw lines in on first scroll
  if (!prefersReduced && svgDesktop) {
    const drawLines = svgDesktop.querySelectorAll('.arch-connector');
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

  // Animate packet along active paths
  function startPacketAnimation() {
    if (prefersReduced) return;
    if (packetTweenDesktop) packetTweenDesktop.kill();
    if (packetTweenMobile) packetTweenMobile.kill();

    // Desktop
    if (packetDesktop) {
      const pathD = getActiveDesktopPath();
      if (pathD && pathD.getTotalLength) {
        const pathLenD = pathD.getTotalLength();
        const trackerD = { progress: 0 };
        packetTweenDesktop = gsap.to(trackerD, {
          progress: 1,
          duration: 3.2,
          repeat: -1,
          ease: 'none',
          onUpdate: () => {
            if (!isTabVisible || !isInView) return;
            const pt = pathD.getPointAtLength(trackerD.progress * pathLenD);
            packetDesktop.setAttribute('cx', pt.x);
            packetDesktop.setAttribute('cy', pt.y);
          }
        });
      }
    }

    // Mobile
    if (packetMobile) {
      const pathM = getActiveMobilePath();
      if (pathM && pathM.getTotalLength) {
        const pathLenM = pathM.getTotalLength();
        const trackerM = { progress: 0 };
        packetTweenMobile = gsap.to(trackerM, {
          progress: 1,
          duration: 3.2,
          repeat: -1,
          ease: 'none',
          onUpdate: () => {
            if (!isTabVisible || !isInView) return;
            const pt = pathM.getPointAtLength(trackerM.progress * pathLenM);
            packetMobile.setAttribute('cx', pt.x);
            packetMobile.setAttribute('cy', pt.y);
          }
        });
      }
    }
  }

  function updateVisualPath() {
    const cfNode = svgDesktop?.querySelector('#node-cf-workers');
    const geminiNode = svgDesktop?.querySelector('#node-gemini');
    const cfNodeM = svgMobile?.querySelector('#node-m-cf');
    const geminiNodeM = svgMobile?.querySelector('#node-m-gemini');

    if (isFailureMode) {
      // Desktop
      primaryPathD?.classList.remove('arch-connector--active');
      fallbackPathD?.classList.add('arch-connector--active');
      cfNode?.classList.add('is-disabled');
      geminiNode?.classList.add('is-active');

      // Mobile
      primaryPathM?.classList.remove('arch-connector--active');
      fallbackPathM?.classList.add('arch-connector--active');
      cfNodeM?.classList.add('is-disabled');
      geminiNodeM?.classList.add('is-active');

      if (simBtn) {
        simBtn.textContent = 'RESET TO PRIMARY ROUTE';
        simBtn.classList.add('is-active');
      }
    } else {
      // Desktop
      primaryPathD?.classList.add('arch-connector--active');
      fallbackPathD?.classList.remove('arch-connector--active');
      cfNode?.classList.remove('is-disabled');
      geminiNode?.classList.remove('is-active');

      // Mobile
      primaryPathM?.classList.add('arch-connector--active');
      fallbackPathM?.classList.remove('arch-connector--active');
      cfNodeM?.classList.remove('is-disabled');
      geminiNodeM?.classList.remove('is-active');

      if (simBtn) {
        simBtn.textContent = 'SIMULATE CLOUD TIMEOUT';
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
        if (!packetTweenDesktop && !packetTweenMobile) startPacketAnimation();
        else {
          if (packetTweenDesktop) packetTweenDesktop.play();
          if (packetTweenMobile) packetTweenMobile.play();
        }
      } else {
        if (packetTweenDesktop) packetTweenDesktop.pause();
        if (packetTweenMobile) packetTweenMobile.pause();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(container);

  // Tab visibility change
  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible && isInView) {
      if (packetTweenDesktop) packetTweenDesktop.play();
      if (packetTweenMobile) packetTweenMobile.play();
    } else {
      if (packetTweenDesktop) packetTweenDesktop.pause();
      if (packetTweenMobile) packetTweenMobile.pause();
    }
  });

  // Initialize
  updateVisualPath();
}
