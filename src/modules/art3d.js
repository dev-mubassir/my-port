/**
 * 3D Art Piece - Neural Map Wireframe Sphere (About Section)
 * Pure Canvas 2D Perspective Projection | Zero external dependencies
 */

function parseColor(str, fallback = [10, 10, 10]) {
  if (!str) return fallback;
  const s = str.trim();
  if (s.startsWith('#')) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length >= 6) {
      return [
        parseInt(hex.slice(0, 2), 16) || fallback[0],
        parseInt(hex.slice(2, 4), 16) || fallback[1],
        parseInt(hex.slice(4, 6), 16) || fallback[2]
      ];
    }
  }
  const match = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (match) {
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
  }
  return fallback;
}

function generateFibonacciSphere(count, jitter = 0.06) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;

    const bx = Math.cos(theta) * rAtY;
    const by = y;
    const bz = Math.sin(theta) * rAtY;

    // Organic jitter offset (~6%)
    const jx = (Math.random() - 0.5) * jitter * 2;
    const jy = (Math.random() - 0.5) * jitter * 2;
    const jz = (Math.random() - 0.5) * jitter * 2;

    const nx = bx + jx;
    const ny = by + jy;
    const nz = bz + jz;
    const len = Math.hypot(nx, ny, nz) || 1;
    const rScale = 1 + (Math.random() - 0.5) * (jitter * 0.8);

    points.push({
      x: (nx / len) * rScale,
      y: (ny / len) * rScale,
      z: (nz / len) * rScale,
      id: i
    });
  }
  return points;
}

function computeEdgesAndAdjacency(points) {
  const edges = [];
  const edgeSet = new Set();
  const adjacency = Array.from({ length: points.length }, () => []);

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const dists = [];
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const p2 = points[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dz = p1.z - p2.z;
      dists.push({ j, dSq: dx * dx + dy * dy + dz * dz });
    }
    dists.sort((a, b) => a.dSq - b.dSq);
    const nearest3 = dists.slice(0, 3);
    for (let k = 0; k < nearest3.length; k++) {
      const j = nearest3[k].j;
      const min = Math.min(i, j);
      const max = Math.max(i, j);
      const key = `${min}_${max}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([min, max]);
      }
      if (!adjacency[i].includes(j)) adjacency[i].push(j);
      if (!adjacency[j].includes(i)) adjacency[j].push(i);
    }
  }
  return { edges, adjacency };
}

function createPulses(count, adjacency) {
  const pulses = [];
  const total = adjacency.length;
  for (let i = 0; i < count; i++) {
    const fromNode = Math.floor(Math.random() * total);
    const neighbors = adjacency[fromNode];
    const toNode = neighbors.length > 0
      ? neighbors[Math.floor(Math.random() * neighbors.length)]
      : (fromNode + 1) % total;
    pulses.push({
      fromNode,
      toNode,
      lastFromNode: fromNode,
      duration: 1.2 + Math.random() * 0.8,
      progress: Math.random()
    });
  }
  return pulses;
}

function projectPoint(x, y, z, cosY, sinY, cosX, sinX, fov, cx, cy) {
  const x1 = x * cosY + z * sinY;
  const z1 = -x * sinY + z * cosY;
  const y2 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;
  const scale = fov / Math.max(1, fov + z2);
  return {
    sx: cx + x1 * scale,
    sy: cy + y2 * scale,
    z: z2
  };
}

export function initArt3D(container, options = {}) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root || typeof window === 'undefined') {
    return { play: () => {}, pause: () => {}, resize: () => {}, destroy: () => {} };
  }

  root.classList.add('art3d-container');
  let canvas = root.querySelector('canvas');
  let ownCanvas = false;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'art3d-canvas';
    root.appendChild(canvas);
    ownCanvas = true;
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    return { play: () => {}, pause: () => {}, resize: () => {}, destroy: () => {} };
  }

  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
  const fov = options.fov || 380;
  const baseSpeed = options.speed !== undefined ? options.speed : 0.12;
  const autoPlay = options.autoPlay !== false;

  let width = 300;
  let height = 300;
  let cx = 150;
  let cy = 150;
  let radius = 110;
  let currentDpr = 1;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = motionQuery.matches;

  let userPaused = !autoPlay;
  let isVisible = false;
  let isTabActive = !document.hidden;
  let isDestroyed = false;
  let rafId = null;

  let isMobile = window.innerWidth < 768;
  let nodes = [];
  let edges = [];
  let adjacency = [];
  let pulses = [];

  const RING_SAMPLES = 72;
  const ringPoints = [];
  const ringTiltX = 0.44;
  const ringTiltZ = 0.22;
  const cosTx = Math.cos(ringTiltX), sinTx = Math.sin(ringTiltX);
  const cosTz = Math.cos(ringTiltZ), sinTz = Math.sin(ringTiltZ);

  for (let i = 0; i < RING_SAMPLES; i++) {
    const angle = (i / RING_SAMPLES) * Math.PI * 2;
    const r = 1.34;
    const x0 = Math.cos(angle) * r;
    const y0 = 0;
    const z0 = Math.sin(angle) * r;
    const x1 = x0;
    const y1 = y0 * cosTx - z0 * sinTx;
    const z1 = y0 * sinTx + z0 * cosTx;
    const x2 = x1 * cosTz - y1 * sinTz;
    const y2 = x1 * sinTz + y1 * cosTz;
    ringPoints.push({ x: x2, y: y2, z: z1 });
  }

  let rotY = 0;
  let wobbleTime = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let tiltX = 0;
  let tiltY = 0;
  let scrollSpin = 0;
  let lastScrollY = window.scrollY || 0;
  let lastTime = 0;

  let introTime = isReducedMotion ? 999 : 0;
  let introComplete = isReducedMotion;

  let inkRGB = [10, 10, 10];
  let signalRGB = [255, 75, 43];

  function updateThemeColors() {
    try {
      const s = window.getComputedStyle(root);
      const ds = window.getComputedStyle(document.documentElement);
      const ink = s.getPropertyValue('--color-ink').trim() || ds.getPropertyValue('--color-ink').trim();
      const sig = s.getPropertyValue('--color-signal').trim() || ds.getPropertyValue('--color-signal').trim();
      inkRGB = parseColor(ink, [10, 10, 10]);
      signalRGB = parseColor(sig, [255, 75, 43]);
    } catch {
      inkRGB = [10, 10, 10];
      signalRGB = [255, 75, 43];
    }
  }

  function initGeometry() {
    isMobile = window.innerWidth < 768;
    const targetNodes = options.nodeCount || (isMobile ? 64 : 110);
    const targetPulses = options.pulses || (isMobile ? 5 : 8);

    if (nodes.length !== targetNodes) {
      nodes = generateFibonacciSphere(targetNodes, 0.06);
      const graph = computeEdgesAndAdjacency(nodes);
      edges = graph.edges;
      adjacency = graph.adjacency;
      pulses = createPulses(targetPulses, adjacency);
    }
  }

  function resize() {
    if (isDestroyed) return;
    const rect = root.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width || root.clientWidth || 300));
    height = Math.max(1, Math.round(rect.height || root.clientHeight || width));

    isMobile = window.innerWidth < 768;
    const maxDpr = isMobile ? 1.5 : 2.0;
    currentDpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    canvas.width = Math.round(width * currentDpr);
    canvas.height = Math.round(height * currentDpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(currentDpr, 0, 0, currentDpr, 0, 0);

    cx = width / 2;
    cy = height / 2;
    radius = Math.min(width, height) * 0.38;

    initGeometry();
    updateThemeColors();

    if (isReducedMotion || !shouldRun()) {
      renderStaticFrame();
    }
  }

  function onPointerMove(e) {
    if (isTouch || options.interactive === false) return;
    const rect = root.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const midY = rect.top + rect.height / 2;
    const maxDX = Math.max(rect.width / 2, window.innerWidth / 3);
    const maxDY = Math.max(rect.height / 2, window.innerHeight / 3);
    const nx = Math.max(-1, Math.min(1, (e.clientX - midX) / maxDX));
    const ny = Math.max(-1, Math.min(1, (e.clientY - midY) / maxDY));
    targetTiltY = nx * 0.35;
    targetTiltX = -ny * 0.35;
  }

  function onPointerLeave() {
    if (isTouch) return;
    targetTiltX = 0;
    targetTiltY = 0;
  }

  function onScroll() {
    const sY = window.scrollY || 0;
    const delta = sY - lastScrollY;
    lastScrollY = sY;
    scrollSpin += delta * 0.0012;
    if (scrollSpin > 0.4) scrollSpin = 0.4;
    if (scrollSpin < -0.4) scrollSpin = -0.4;
  }

  function advancePulses(dt) {
    for (let i = 0; i < pulses.length; i++) {
      const p = pulses[i];
      p.progress += dt / p.duration;
      if (p.progress >= 1) {
        p.progress = 0;
        p.lastFromNode = p.fromNode;
        p.fromNode = p.toNode;
        const neighbors = adjacency[p.fromNode] || [];
        const fwd = neighbors.filter((n) => n !== p.lastFromNode);
        p.toNode = fwd.length > 0 ? fwd[Math.floor(Math.random() * fwd.length)] : (neighbors[0] ?? 0);
        p.duration = 1.2 + Math.random() * 0.8;
      }
    }
  }

  function renderFrame(dt) {
    ctx.clearRect(0, 0, width, height);

    if (!introComplete) {
      introTime += dt;
      if (introTime >= 1.5) introComplete = true;
    }

    wobbleTime += dt;
    const wobbleX = Math.sin(wobbleTime * 0.45) * 0.12;

    if (!isTouch) {
      tiltX += (targetTiltX - tiltX) * 0.06;
      tiltY += (targetTiltY - tiltY) * 0.06;
    } else {
      tiltX = 0;
      tiltY = 0;
    }

    scrollSpin *= 0.92;
    rotY += (baseSpeed + scrollSpin) * dt;

    const angleX = wobbleX + tiltX;
    const angleY = rotY + tiltY;

    const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX), sinX = Math.sin(angleX);

    const edgeFade = introComplete ? 1 : Math.max(0, Math.min(1, (introTime - 0.75) / 0.45));
    const ringFade = introComplete ? 1 : Math.max(0, Math.min(1, (introTime - 0.50) / 0.50));
    const pulseFade = introComplete ? 1 : Math.max(0, Math.min(1, (introTime - 1.00) / 0.35));

    // Project nodes
    const projected = new Array(nodes.length);
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      let scale = 1;
      if (!introComplete) {
        const delay = (i / nodes.length) * 0.42;
        const pt = Math.max(0, Math.min(1, (introTime - delay) / 0.78));
        scale = 1 - Math.pow(1 - pt, 3);
      }
      const rawX = node.x * radius * scale;
      const rawY = node.y * radius * scale;
      const rawZ = node.z * radius * scale;
      const pt = projectPoint(rawX, rawY, rawZ, cosY, sinY, cosX, sinX, fov, cx, cy);
      const tz = Math.max(0, Math.min(1, (radius - pt.z) / (2 * radius)));
      projected[i] = { sx: pt.sx, sy: pt.sy, z: pt.z, tz, scale, rawX, rawY, rawZ };
    }

    // Edges (Batched into 4 depth buckets)
    if (edgeFade > 0.001) {
      ctx.lineWidth = 1;
      const b0 = [], b1 = [], b2 = [], b3 = [];

      for (let i = 0; i < edges.length; i++) {
        const [u, v] = edges[i];
        const p1 = projected[u];
        const p2 = projected[v];
        const tz = Math.max(0, Math.min(1, (radius - (p1.z + p2.z) * 0.5) / (2 * radius)));
        if (tz < 0.25) {
          b0.push(p1.sx, p1.sy, p2.sx, p2.sy);
        } else if (tz < 0.5) {
          b1.push(p1.sx, p1.sy, p2.sx, p2.sy);
        } else if (tz < 0.75) {
          b2.push(p1.sx, p1.sy, p2.sx, p2.sy);
        } else {
          b3.push(p1.sx, p1.sy, p2.sx, p2.sy);
        }
      }

      const buckets = [
        { data: b0, alpha: (0.08 + 0.42 * 0.12) * edgeFade },
        { data: b1, alpha: (0.08 + 0.42 * 0.37) * edgeFade },
        { data: b2, alpha: (0.08 + 0.42 * 0.62) * edgeFade },
        { data: b3, alpha: (0.08 + 0.42 * 0.88) * edgeFade }
      ];

      for (let b = 0; b < buckets.length; b++) {
        const d = buckets[b].data;
        if (d.length === 0) continue;
        ctx.strokeStyle = `rgba(10, 10, 10, ${buckets[b].alpha})`;
        ctx.beginPath();
        for (let j = 0; j < d.length; j += 4) {
          ctx.moveTo(d[j], d[j + 1]);
          ctx.lineTo(d[j + 2], d[j + 3]);
        }
        ctx.stroke();
      }
    }

    // Orbit ring (Single batched stroke)
    if (ringFade > 0.001) {
      const ringRadius = radius * 1.34;
      const precess = wobbleTime * 0.08;
      const cosP = Math.cos(precess), sinP = Math.sin(precess);
      const projRing = new Array(RING_SAMPLES);

      for (let i = 0; i < RING_SAMPLES; i++) {
        const p = ringPoints[i];
        const rx0 = p.x * radius;
        const ry0 = p.y * radius;
        const rz0 = p.z * radius;
        const rx1 = rx0 * cosP + rz0 * sinP;
        const rz1 = -rx0 * sinP + rz0 * cosP;
        const pt = projectPoint(rx1, ry0, rz1, cosY, sinY, cosX, sinX, fov, cx, cy);
        projRing[i] = pt;
      }

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 75, 43, ${0.55 * ringFade})`;
      ctx.beginPath();
      ctx.moveTo(projRing[0].sx, projRing[0].sy);
      for (let i = 1; i < RING_SAMPLES; i++) {
        ctx.lineTo(projRing[i].sx, projRing[i].sy);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Pulses
    if (pulseFade > 0.001) {
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        const nA = projected[p.fromNode];
        const nB = projected[p.toNode];
        if (!nA || !nB) continue;

        const prog = p.progress;
        const tailProg = Math.max(0, prog - 0.22);

        const hx = (1 - prog) * nA.rawX + prog * nB.rawX;
        const hy = (1 - prog) * nA.rawY + prog * nB.rawY;
        const hz = (1 - prog) * nA.rawZ + prog * nB.rawZ;

        const tx = (1 - tailProg) * nA.rawX + tailProg * nB.rawX;
        const ty = (1 - tailProg) * nA.rawY + tailProg * nB.rawY;
        const tz = (1 - tailProg) * nA.rawZ + tailProg * nB.rawZ;

        const ptHead = projectPoint(hx, hy, hz, cosY, sinY, cosX, sinX, fov, cx, cy);
        const ptTail = projectPoint(tx, ty, tz, cosY, sinY, cosX, sinX, fov, cx, cy);

        const tzNorm = Math.max(0, Math.min(1, (radius - ptHead.z) / (2 * radius)));
        const alpha = (0.35 + 0.65 * tzNorm) * pulseFade;
        const dotR = 1.2 + 1.6 * tzNorm;

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(255, 75, 43, ${alpha * 0.75})`;
        ctx.beginPath();
        ctx.moveTo(ptTail.sx, ptTail.sy);
        ctx.lineTo(ptHead.sx, ptHead.sy);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 75, 43, ${alpha})`;
        ctx.beginPath();
        ctx.arc(ptHead.sx, ptHead.sy, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Nodes (Batched into 3 depth/size buckets: back, mid, front)
    const nodeB0 = [];
    const nodeB1 = [];
    const nodeB2 = [];

    for (let k = 0; k < projected.length; k++) {
      const p = projected[k];
      if (p.tz < 0.33) {
        nodeB0.push(p);
      } else if (p.tz < 0.66) {
        nodeB1.push(p);
      } else {
        nodeB2.push(p);
      }
    }

    const nodeBuckets = [
      { list: nodeB0, r: 1.2, alpha: 0.22 },
      { list: nodeB1, r: 1.8, alpha: 0.40 },
      { list: nodeB2, r: 2.6, alpha: 0.65 }
    ];

    for (let b = 0; b < nodeBuckets.length; b++) {
      const nb = nodeBuckets[b];
      if (nb.list.length === 0) continue;
      ctx.fillStyle = `rgba(10, 10, 10, ${nb.alpha})`;
      ctx.beginPath();
      for (let j = 0; j < nb.list.length; j++) {
        const p = nb.list[j];
        ctx.moveTo(p.sx + nb.r, p.sy);
        ctx.arc(p.sx, p.sy, nb.r, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }

  function renderStaticFrame() {
    introComplete = true;
    introTime = 999;
    rotY = 0.55;
    tiltX = 0.16;
    tiltY = 0;
    renderFrame(0);
  }

  function shouldRun() {
    return !userPaused && isVisible && isTabActive && !isReducedMotion && !isDestroyed;
  }

  function loop(timestamp) {
    if (!shouldRun()) {
      rafId = null;
      return;
    }
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    advancePulses(dt);
    renderFrame(dt);
    rafId = requestAnimationFrame(loop);
  }

  function updateRunningState() {
    if (shouldRun()) {
      if (!rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    } else {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (isReducedMotion) {
        renderStaticFrame();
      }
    }
  }

  function play() {
    userPaused = false;
    updateRunningState();
  }

  function pause() {
    userPaused = true;
    updateRunningState();
  }

  function destroy() {
    isDestroyed = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    if (themeObserver) themeObserver.disconnect();

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibilityChange);

    if (motionQuery.removeEventListener) {
      motionQuery.removeEventListener('change', onMotionChange);
    } else if (motionQuery.removeListener) {
      motionQuery.removeListener(onMotionChange);
    }

    if (ownCanvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }

  const onVisibilityChange = () => {
    isTabActive = !document.hidden;
    updateRunningState();
  };

  const onMotionChange = (e) => {
    isReducedMotion = e.matches;
    if (isReducedMotion) renderStaticFrame();
    updateRunningState();
  };

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(root);

  const intersectionObserver = new IntersectionObserver((entries) => {
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].target === root) {
        isVisible = entries[i].isIntersecting;
        updateRunningState();
      }
    }
  }, { threshold: 0.05 });
  intersectionObserver.observe(root);

  let themeObserver = null;
  if (typeof MutationObserver !== 'undefined') {
    themeObserver = new MutationObserver(() => updateThemeColors());
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-nav-theme', 'style']
    });
  }

  if (!isTouch && options.interactive !== false) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', onMotionChange);
  } else if (motionQuery.addListener) {
    motionQuery.addListener(onMotionChange);
  }

  initGeometry();
  updateThemeColors();
  resize();

  return { play, pause, resize, destroy };
}
