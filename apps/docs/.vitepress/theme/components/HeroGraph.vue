<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animId = 0;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const N = 200;
  const edges: [number, number][] = [];
  const degree: number[] = new Array(N).fill(0);
  const M = 2;

  for (let i = 0; i <= M; i++) {
    for (let j = i + 1; j <= M; j++) {
      edges.push([i, j]);
      degree[i]++;
      degree[j]++;
    }
  }
  for (let i = M + 1; i < N; i++) {
    const targets = new Set<number>();
    const totalDeg = degree.reduce((a, b) => a + b, 0);
    while (targets.size < M) {
      let r = Math.random() * totalDeg;
      for (let j = 0; j < i; j++) {
        r -= degree[j];
        if (r <= 0) { targets.add(j); break; }
      }
    }
    for (const t of targets) {
      edges.push([i, t]);
      degree[i]++;
      degree[t]++;
    }
  }

  const maxDeg = Math.max(...degree);
  const pos: [number, number][] = [];
  const vel: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    pos.push([Math.random() * W, Math.random() * H]);
    vel.push([0, 0]);
  }

  const k = Math.sqrt((W * H) / N) * 0.6;
  let hovered = -1;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    hovered = -1;
    for (let i = 0; i < N; i++) {
      const dx = pos[i][0] - mx;
      const dy = pos[i][1] - my;
      if (dx * dx + dy * dy < 200) {
        hovered = i;
        break;
      }
    }
  });

  canvas.addEventListener('mouseleave', () => { hovered = -1; });

  function tick() {
    for (let i = 0; i < N; i++) { vel[i] = [0, 0]; }

    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pos[i][0] - pos[j][0];
        const dy = pos[i][1] - pos[j][1];
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const f = (k * k) / (dist * dist) * 0.5;
        vel[i][0] += (dx / dist) * f;
        vel[i][1] += (dy / dist) * f;
        vel[j][0] -= (dx / dist) * f;
        vel[j][1] -= (dy / dist) * f;
      }
    }

    for (const [a, b] of edges) {
      const dx = pos[a][0] - pos[b][0];
      const dy = pos[a][1] - pos[b][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const f = (dist / k) * 0.4;
      vel[a][0] -= (dx / dist) * f;
      vel[a][1] -= (dy / dist) * f;
      vel[b][0] += (dx / dist) * f;
      vel[b][1] += (dy / dist) * f;
    }

    const cx = W / 2, cy = H / 2;
    for (let i = 0; i < N; i++) {
      const dx = pos[i][0] - cx;
      const dy = pos[i][1] - cy;
      vel[i][0] -= dx * 0.001;
      vel[i][1] -= dy * 0.001;
    }

    for (let i = 0; i < N; i++) {
      const speed = Math.sqrt(vel[i][0] ** 2 + vel[i][1] ** 2);
      const cap = 2;
      if (speed > cap) {
        vel[i][0] = (vel[i][0] / speed) * cap;
        vel[i][1] = (vel[i][1] / speed) * cap;
      }
      pos[i][0] += vel[i][0];
      pos[i][1] += vel[i][1];
      pos[i][0] = Math.max(20, Math.min(W - 20, pos[i][0]));
      pos[i][1] = Math.max(20, Math.min(H - 20, pos[i][1]));
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (const [a, b] of edges) {
      const isHoverEdge = a === hovered || b === hovered;
      ctx.beginPath();
      ctx.moveTo(pos[a][0], pos[a][1]);
      ctx.lineTo(pos[b][0], pos[b][1]);
      ctx.strokeStyle = isHoverEdge
        ? 'rgba(100, 200, 255, 0.6)'
        : 'rgba(100, 160, 255, 0.08)';
      ctx.lineWidth = isHoverEdge ? 1.2 : 0.4;
      ctx.stroke();
    }

    for (let i = 0; i < N; i++) {
      const r = 1.5 + (degree[i] / maxDeg) * 5;
      const isHub = degree[i] > maxDeg * 0.4;
      const isHover = i === hovered;

      if (isHover) {
        ctx.beginPath();
        ctx.arc(pos[i][0], pos[i][1], r + 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 200, 255, 0.15)';
        ctx.fill();
      }

      if (isHub) {
        ctx.beginPath();
        ctx.arc(pos[i][0], pos[i][1], r + 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 200, 255, 0.08)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(pos[i][0], pos[i][1], r, 0, Math.PI * 2);
      const hue = isHover ? 180 : 210 + (degree[i] / maxDeg) * 40;
      const lightness = isHover ? 70 : 50 + (degree[i] / maxDeg) * 15;
      ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;
      ctx.fill();
    }
  }

  function loop() {
    tick();
    draw();
    animId = requestAnimationFrame(loop);
  }
  loop();
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
