<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animId = 0;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const dpr = window.devicePixelRatio || 1;
  let W = canvas.clientWidth;
  let H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const N = 120;
  const CONNECT_DIST = 140;
  const MOUSE_RADIUS = 200;

  const nodes: { x: number; y: number; vx: number; vy: number; r: number; hue: number }[] = [];
  for (let i = 0; i < N; i++) {
    nodes.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: 1.5 + Math.random() * 2.5,
      hue: 200 + Math.random() * 60,
    });
  }

  let mouseX = -1000;
  let mouseY = -1000;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  function loop() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < N; i++) {
      const n = nodes[i];

      // Drift
      n.x += n.vx;
      n.y += n.vy;

      // Mouse interaction — gentle attraction with nearby repulsion
      const dx = mouseX - n.x;
      const dy = mouseY - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        if (dist < 60) {
          // Repel when very close
          n.vx -= (dx / dist) * force * 0.3;
          n.vy -= (dy / dist) * force * 0.3;
        } else {
          // Attract gently
          n.vx += (dx / dist) * force * 0.05;
          n.vy += (dy / dist) * force * 0.05;
        }
      }

      // Speed limit
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > 1.2) {
        n.vx = (n.vx / speed) * 1.2;
        n.vy = (n.vy / speed) * 1.2;
      }

      // Slight friction to keep things gentle
      n.vx *= 0.995;
      n.vy *= 0.995;

      // Random nudge to keep movement alive
      n.vx += (Math.random() - 0.5) * 0.02;
      n.vy += (Math.random() - 0.5) * 0.02;

      // Wrap around edges
      if (n.x < -20) n.x = W + 20;
      if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20;
      if (n.y > H + 20) n.y = -20;
    }

    // Draw edges between nearby nodes
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (let i = 0; i < N; i++) {
      const n = nodes[i];
      const dx = mouseX - n.x;
      const dy = mouseY - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nearMouse = dist < MOUSE_RADIUS;

      // Glow for nodes near mouse
      if (nearMouse) {
        const glow = (1 - dist / MOUSE_RADIUS) * 0.4;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${glow})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      const lightness = nearMouse ? 70 : 55;
      ctx.fillStyle = `hsl(${n.hue}, 80%, ${lightness}%)`;
      ctx.fill();
    }

    animId = requestAnimationFrame(loop);
  }

  loop();

  const handleResize = () => {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  };
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  cancelAnimationFrame(animId);
});
</script>

<template>
  <div class="hero-graph-wrapper">
    <canvas ref="canvasRef" class="hero-graph-canvas" />
  </div>
</template>

<style scoped>
.hero-graph-wrapper {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
  opacity: 0.6;
}
.hero-graph-canvas {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}
</style>
