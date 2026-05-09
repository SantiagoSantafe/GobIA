import { useEffect, useRef } from "react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const randomBetween = (min, max) => min + Math.random() * (max - min);

function createDustParticles(width, height, count) {
  return Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    homeX: 0,
    homeY: 0,
    radius: randomBetween(0.65, 1.85),
    alpha: randomBetween(0.12, 0.42),
    vx: randomBetween(-0.018, 0.018),
    vy: randomBetween(-0.012, 0.012),
    seed: Math.random() * 10 + index * 0.013,
    tone:
      Math.random() < 0.12
        ? "orange"
        : Math.random() < 0.34
          ? "blue"
          : "slate",
  }));
}

function createNodeParticles(width, height, count) {
  return Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    homeX: 0,
    homeY: 0,
    radius: randomBetween(1.8, 3.8),
    alpha: randomBetween(0.2, 0.54),
    blur: randomBetween(6, 16),
    vx: randomBetween(-0.028, 0.028),
    vy: randomBetween(-0.02, 0.02),
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: randomBetween(0.008, 0.022),
    isHub: Math.random() < 0.22,
    seed: Math.random() * 8 + index * 0.021,
    tone: Math.random() < 0.46 ? "blue" : "slate",
  }));
}

function wrapParticle(particle, width, height, padding = 28) {
  if (particle.x < -padding) particle.x = width + padding;
  if (particle.x > width + padding) particle.x = -padding;
  if (particle.y < -padding) particle.y = height + padding;
  if (particle.y > height + padding) particle.y = -padding;
}

function wrapCoordinates(entity, width, height, xKey, yKey, padding = 28) {
  if (entity[xKey] < -padding) entity[xKey] = width + padding;
  if (entity[xKey] > width + padding) entity[xKey] = -padding;
  if (entity[yKey] < -padding) entity[yKey] = height + padding;
  if (entity[yKey] > height + padding) entity[yKey] = -padding;
}

function buildLinks(nodes, maxDistance = 230, maxPerNode = 4) {
  const ranked = nodes.map(() => []);

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const distance = Math.hypot(dx, dy);

      if (distance > maxDistance) continue;

      const link = { a: i, b: j, distance };
      ranked[i].push(link);
      ranked[j].push(link);
    }
  }

  const deduped = new Map();

  ranked.forEach((links) => {
    links
      .sort((left, right) => left.distance - right.distance)
      .slice(0, maxPerNode)
      .forEach((link) => {
        const key = `${Math.min(link.a, link.b)}-${Math.max(link.a, link.b)}`;
        deduped.set(key, link);
      });
  });

  return [...deduped.values()].sort((left, right) => left.distance - right.distance);
}

function createSignal(links) {
  if (!links.length) return null;

  const preferred = links.filter((link) => link.distance < 210);
  const pool = preferred.length ? preferred : links;
  const selected = pool[Math.floor(Math.random() * pool.length)];

  return {
    a: selected.a,
    b: selected.b,
    progress: Math.random(),
    speed: randomBetween(0.0028, 0.0062),
    radius: randomBetween(1.4, 2.8),
    alpha: randomBetween(0.3, 0.7),
    tone:
      Math.random() < 0.36
        ? "orange"
        : Math.random() < 0.7
          ? "blue"
          : "slate",
  };
}

function getCursorLinks(nodes, cursor, maxLinks = 6, maxDistance = 280) {
  if (!cursor.active) return [];

  return nodes
    .map((node, index) => {
      const dx = cursor.x - node.x;
      const dy = cursor.y - node.y;
      const distance = Math.hypot(dx, dy);
      const score = distance - (node.isHub ? 40 : 0) - (node.tone === "blue" ? 12 : 0);

      return { index, distance, score };
    })
    .filter((link) => link.distance <= maxDistance)
    .sort((left, right) => left.score - right.score)
    .slice(0, maxLinks);
}

export function HeroParticleField({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = mediaQuery.matches;
    const handleMotionChange = (event) => {
      reducedMotion = event.matches;
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMotionChange);
    } else {
      mediaQuery.addListener(handleMotionChange);
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let dust = [];
    let nodes = [];
    let signals = [];
    let frame = 0;
    const cursor = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
      pointerInside: false,
      lastMoveAt: 0,
    };

    const drawScene = () => {
      ctx.clearRect(0, 0, width, height);
      const links = buildLinks(nodes);
      const cursorLinks = getCursorLinks(nodes, cursor);

      for (const link of links) {
        const a = nodes[link.a];
        const b = nodes[link.b];
        const intensity = 1 - link.distance / 230;
        const hasHub = a.isHub || b.isHub;
        const hasBlue = a.tone === "blue" || b.tone === "blue";

        ctx.beginPath();
        ctx.strokeStyle = hasHub
          ? `rgba(232, 96, 28, ${0.09 + intensity * 0.18})`
          : hasBlue
            ? `rgba(96, 165, 250, ${0.08 + intensity * 0.16})`
            : `rgba(148, 163, 184, ${0.07 + intensity * 0.13})`;
        ctx.lineWidth = hasHub ? 1.15 : hasBlue ? 0.9 : 0.8;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      if (cursorLinks.length) {
        for (const link of cursorLinks) {
          const node = nodes[link.index];
          const intensity = 1 - link.distance / 280;

          ctx.beginPath();
          ctx.strokeStyle = node.isHub
            ? `rgba(232, 96, 28, ${0.16 + intensity * 0.22})`
            : node.tone === "blue"
              ? `rgba(96, 165, 250, ${0.14 + intensity * 0.22})`
              : `rgba(148, 163, 184, ${0.11 + intensity * 0.18})`;
          ctx.lineWidth = node.isHub ? 1.35 : 1.05;
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(cursor.x, cursor.y);
          ctx.stroke();
        }

        ctx.save();
        ctx.beginPath();
        ctx.shadowBlur = 24;
        ctx.shadowColor = "rgba(232, 96, 28, 0.18)";
        ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
        ctx.arc(cursor.x, cursor.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const particle of dust) {
        const cursorDx = cursor.x - particle.x;
        const cursorDy = cursor.y - particle.y;
        const cursorDistance = cursor.active ? Math.hypot(cursorDx, cursorDy) : Infinity;
        const highlight = cursor.active && cursorDistance < 170
          ? 0.06 * (1 - cursorDistance / 170)
          : 0;

        ctx.beginPath();
        ctx.fillStyle =
          particle.tone === "orange"
            ? `rgba(232, 96, 28, ${Math.min(particle.alpha + 0.08 + highlight, 0.62)})`
            : particle.tone === "blue"
              ? `rgba(96, 165, 250, ${Math.min(particle.alpha + 0.08 + highlight, 0.62)})`
              : `rgba(71, 85, 105, ${Math.min(particle.alpha + highlight, 0.5)})`;
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const node of nodes) {
        const pulse = 1 + Math.sin(node.pulsePhase) * (node.isHub ? 0.22 : 0.12);
        const radius = node.radius * pulse;

        ctx.save();
        ctx.shadowBlur = node.blur * (node.isHub ? 1.35 : node.tone === "blue" ? 1.14 : 1);
        ctx.shadowColor = node.isHub
          ? `rgba(232, 96, 28, ${Math.min(node.alpha + 0.12, 0.52)})`
          : node.tone === "blue"
            ? `rgba(96, 165, 250, ${Math.min(node.alpha + 0.08, 0.5)})`
            : `rgba(148, 163, 184, ${Math.min(node.alpha + 0.06, 0.44)})`;
        ctx.beginPath();
        ctx.fillStyle = node.isHub
          ? `rgba(232, 96, 28, ${Math.min(node.alpha + 0.12, 0.66)})`
          : node.tone === "blue"
            ? `rgba(96, 165, 250, ${Math.min(node.alpha + 0.08, 0.6)})`
            : `rgba(100, 116, 139, ${node.alpha})`;
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (node.isHub) {
          ctx.beginPath();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = `rgba(232, 96, 28, ${0.2 + Math.sin(node.pulsePhase) * 0.05})`;
          ctx.arc(node.x, node.y, radius + 4.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      for (const signal of signals) {
        const from = nodes[signal.a];
        const to = nodes[signal.b];

        if (!from || !to) continue;

        const x = from.x + (to.x - from.x) * signal.progress;
        const y = from.y + (to.y - from.y) * signal.progress;

        ctx.save();
        ctx.beginPath();
        ctx.shadowBlur = signal.tone === "orange" ? 18 : signal.tone === "blue" ? 16 : 12;
        ctx.shadowColor = signal.tone === "orange"
          ? `rgba(232, 96, 28, ${signal.alpha})`
          : signal.tone === "blue"
            ? `rgba(96, 165, 250, ${signal.alpha})`
            : `rgba(148, 163, 184, ${signal.alpha})`;
        ctx.fillStyle = signal.tone === "orange"
          ? `rgba(232, 96, 28, ${Math.min(signal.alpha + 0.18, 0.86)})`
          : signal.tone === "blue"
            ? `rgba(96, 165, 250, ${Math.min(signal.alpha + 0.18, 0.86)})`
            : `rgba(100, 116, 139, ${Math.min(signal.alpha + 0.12, 0.78)})`;
        ctx.arc(x, y, signal.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const link of cursorLinks) {
        const node = nodes[link.index];
        const progress = (frame * (0.012 + (node.seed % 0.011)) + node.seed * 0.14) % 1;
        const x = node.x + (cursor.x - node.x) * progress;
        const y = node.y + (cursor.y - node.y) * progress;

        ctx.save();
        ctx.beginPath();
        ctx.shadowBlur = node.isHub ? 18 : 14;
        ctx.shadowColor = node.isHub
          ? "rgba(232, 96, 28, 0.44)"
          : node.tone === "blue"
            ? "rgba(96, 165, 250, 0.42)"
            : "rgba(148, 163, 184, 0.32)";
        ctx.fillStyle = node.isHub
          ? "rgba(232, 96, 28, 0.9)"
          : node.tone === "blue"
            ? "rgba(96, 165, 250, 0.88)"
            : "rgba(148, 163, 184, 0.72)";
        ctx.arc(x, y, node.isHub ? 2.2 : 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      return links;
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(bounds.width, 1);
      height = Math.max(bounds.height, 1);
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = width * height;
      const dustCount = clamp(Math.round(area / 2800), 180, 420);
      const nodeCount = clamp(Math.round(area / 34000), 24, 38);

      dust = createDustParticles(width, height, dustCount);
      nodes = createNodeParticles(width, height, nodeCount);
      dust.forEach((particle) => {
        particle.homeX = particle.x;
        particle.homeY = particle.y;
      });
      nodes.forEach((node) => {
        node.homeX = node.x;
        node.homeY = node.y;
      });
      cursor.x = width * 0.58;
      cursor.y = height * 0.42;
      cursor.targetX = cursor.x;
      cursor.targetY = cursor.y;
      const links = buildLinks(nodes);
      const signalCount = clamp(Math.round(nodeCount / 3), 7, 14);
      signals = Array.from({ length: signalCount }, () => createSignal(links)).filter(Boolean);

      drawScene();
    };

    const tick = () => {
      const now = performance.now();
      frame += 1;
      cursor.active = cursor.pointerInside && now - cursor.lastMoveAt < 140;

      if (cursor.active) {
        cursor.x += (cursor.targetX - cursor.x) * 0.16;
        cursor.y += (cursor.targetY - cursor.y) * 0.16;
      }

      for (const particle of dust) {
        particle.homeX += particle.vx;
        particle.homeY += particle.vy;
        wrapCoordinates(particle, width, height, "homeX", "homeY");

        if (cursor.active) {
          const dx = cursor.x - particle.x;
          const dy = cursor.y - particle.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 160 && distance > 0) {
            const strength = (1 - distance / 160) * 0.028;
            particle.x += dx * strength;
            particle.y += dy * strength;
          }
        }

        particle.x += (particle.homeX - particle.x) * (cursor.active ? 0.045 : 0.085);
        particle.y += (particle.homeY - particle.y) * (cursor.active ? 0.045 : 0.085);
        wrapParticle(particle, width, height);
      }

      for (const node of nodes) {
        node.homeX += node.vx;
        node.homeY += node.vy;
        wrapCoordinates(node, width, height, "homeX", "homeY");
        node.pulsePhase += node.pulseSpeed;

        if (cursor.active) {
          const dx = cursor.x - node.x;
          const dy = cursor.y - node.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 300 && distance > 0) {
            const strength = (1 - distance / 300) * (node.isHub ? 0.038 : 0.026);
            node.x += dx * strength;
            node.y += dy * strength;
          }
        }

        node.x += (node.homeX - node.x) * (cursor.active ? 0.032 : 0.072);
        node.y += (node.homeY - node.y) * (cursor.active ? 0.032 : 0.072);
        wrapParticle(node, width, height);
      }

      const links = buildLinks(nodes);

      for (let i = 0; i < signals.length; i += 1) {
        const signal = signals[i];
        if (!signal) continue;

        signal.progress += signal.speed;

        const activeLink = links.find((link) =>
          (link.a === signal.a && link.b === signal.b) ||
          (link.a === signal.b && link.b === signal.a)
        );

        if (!activeLink || signal.progress >= 1) {
          signals[i] = createSignal(links);
        }
      }

      drawScene();
      rafId = window.requestAnimationFrame(tick);
    };

    const updatePointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (!inside) {
        clearPointer();
        return;
      }

      cursor.targetX = event.clientX - bounds.left;
      cursor.targetY = event.clientY - bounds.top;
      cursor.pointerInside = true;
      cursor.active = true;
      cursor.lastMoveAt = performance.now();

      if (reducedMotion) {
        cursor.x = cursor.targetX;
        cursor.y = cursor.targetY;
        drawScene();
      }
    };

    const clearPointer = () => {
      cursor.pointerInside = false;
      cursor.active = false;

      if (reducedMotion) {
        drawScene();
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", updatePointer);
    window.addEventListener("pointerleave", clearPointer);

    if (!reducedMotion) {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerleave", clearPointer);

      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMotionChange);
      } else {
        mediaQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
