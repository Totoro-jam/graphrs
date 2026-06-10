<script setup lang="ts">
import { Sandpack } from 'sandpack-vue3';
import { useData } from 'vitepress';
import { computed, ref } from 'vue';

const props = defineProps<{ code: string }>();
const { isDark } = useData();
const showCode = ref(false);
const isFullscreen = ref(false);

const graphShimCode = `
class NodeNotFoundError extends Error {
  constructor(id) { super("Node not found: " + id); this.name = "NodeNotFoundError"; }
}
class EdgeNotFoundError extends Error {
  constructor(s, t) { super("Edge not found: " + s + " -> " + t); this.name = "EdgeNotFoundError"; }
}

export class Graph {
  constructor(options) {
    this._directed = !!(options && options.directed);
    this._nodes = new Map();
    this._adjacency = new Map();
    this._edges = [];
  }

  addNode(id, data) {
    if (!this._nodes.has(id)) {
      this._nodes.set(id, data || {});
      this._adjacency.set(id, []);
    } else if (data !== undefined) {
      this._nodes.set(id, data);
    }
    return this;
  }

  addEdge(source, target, data) {
    this.addNode(source);
    this.addNode(target);
    const edge = { source, target, data: data || {} };
    this._edges.push(edge);
    this._adjacency.get(source).push(target);
    if (!this._directed) {
      this._adjacency.get(target).push(source);
    }
    return this;
  }

  removeNode(id) {
    if (!this._nodes.has(id)) throw new NodeNotFoundError(id);
    this._nodes.delete(id);
    this._adjacency.delete(id);
    this._edges = this._edges.filter(e => e.source !== id && e.target !== id);
    for (const [, neighbors] of this._adjacency) {
      while (neighbors.indexOf(id) !== -1) neighbors.splice(neighbors.indexOf(id), 1);
    }
    return this;
  }

  nodeCount() { return this._nodes.size; }
  edgeCount() { return this._edges.length; }
  hasNode(id) { return this._nodes.has(id); }
  nodes() { return [...this._nodes.keys()]; }
  edges() { return this._edges.map(e => ({ source: e.source, target: e.target, data: e.data })); }
  nodeData(id) { if (!this._nodes.has(id)) throw new NodeNotFoundError(id); return this._nodes.get(id); }

  neighbors(id) {
    if (!this._adjacency.has(id)) throw new NodeNotFoundError(id);
    return [...this._adjacency.get(id)];
  }

  degree(id) {
    if (!this._adjacency.has(id)) throw new NodeNotFoundError(id);
    return this._adjacency.get(id).length;
  }

  hasEdge(source, target) {
    if (this._directed) return this._edges.some(e => e.source === source && e.target === target);
    return this._edges.some(e => (e.source === source && e.target === target) || (e.source === target && e.target === source));
  }

  toG6Format() {
    return {
      nodes: this.nodes().map(id => ({ id: String(id), data: this._nodes.get(id) || {} })),
      edges: this._edges.map(e => ({ source: String(e.source), target: String(e.target), data: e.data || {} })),
    };
  }

  static fromEdges(edges, options) {
    const opts = typeof options === 'boolean' ? { directed: options } : options;
    const g = new Graph(opts);
    for (const e of edges) g.addEdge(e[0], e[1]);
    return g;
  }
}
`;

const canvasUtilCode = `
export function createCanvas(container) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;width:100%;height:100%';
  container.appendChild(wrapper);
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;background:#080b12';
  wrapper.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let cW = 0, cH = 0, drawFn = null;

  function resize() {
    cW = wrapper.clientWidth || 800;
    cH = wrapper.clientHeight || 600;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cW * dpr);
    canvas.height = Math.round(cH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (drawFn) drawFn();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(wrapper);
  const mq = window.matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)');
  mq.addEventListener('change', resize);
  resize();

  return {
    canvas,
    ctx,
    wrapper,
    get width() { return cW; },
    get height() { return cH; },
    onResize(fn) { drawFn = fn; },
    dispose() { ro.disconnect(); mq.removeEventListener('change', resize); }
  };
}
`;

const zoomPanCode = `
export function enableZoomPan(canvas, drawFn) {
  let scale = 1, offsetX = 0, offsetY = 0;
  let dragging = false, lastX = 0, lastY = 0;

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const zoom = e.deltaY < 0 ? 1.12 : 0.89;
    offsetX = mx - (mx - offsetX) * zoom;
    offsetY = my - (my - offsetY) * zoom;
    scale *= zoom;
    drawFn(scale, offsetX, offsetY);
  }, { passive: false });

  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    offsetX += e.clientX - lastX;
    offsetY += e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    drawFn(scale, offsetX, offsetY);
  });
  canvas.addEventListener('mouseup', () => { dragging = false; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('mouseleave', () => { dragging = false; canvas.style.cursor = 'grab'; });

  let lastTouchDist = 0;
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) { dragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; }
    else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.sqrt(dx*dx + dy*dy);
    }
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging) {
      offsetX += e.touches[0].clientX - lastX; offsetY += e.touches[0].clientY - lastY;
      lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
      drawFn(scale, offsetX, offsetY);
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (lastTouchDist > 0) {
        const zoom = dist / lastTouchDist;
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = canvas.getBoundingClientRect();
        offsetX = (cx-rect.left) - ((cx-rect.left) - offsetX) * zoom;
        offsetY = (cy-rect.top) - ((cy-rect.top) - offsetY) * zoom;
        scale *= zoom;
        drawFn(scale, offsetX, offsetY);
      }
      lastTouchDist = dist;
    }
  }, { passive: false });
  canvas.addEventListener('touchend', () => { dragging = false; lastTouchDist = 0; });
  canvas.style.cursor = 'grab';
  canvas.style.touchAction = 'none';

  return { getTransform: () => ({ scale, offsetX, offsetY }) };
}
`;

const files = computed(() => ({
  '/index.ts': {
    code: props.code.trim(),
    active: true,
  },
  '/graphrs-core.js': {
    code: graphShimCode.trim(),
    hidden: true,
  },
  '/zoom-pan.js': {
    code: zoomPanCode.trim(),
    hidden: true,
  },
  '/canvas-util.js': {
    code: canvasUtilCode.trim(),
    hidden: true,
  },
  '/index.html': {
    code: '<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8" /><title>graphrs</title></head>\n<body style="margin:0;overflow:hidden">\n  <div id="app" style="width:100vw;height:100vh"></div>\n  <script type="module" src="./index.ts"><\/script>\n</body>\n</html>',
    hidden: true,
  },
}));

const customSetup = { dependencies: {} };

const sandpackOptions = computed(() => ({
  showConsole: true,
  showConsoleButton: true,
  editorHeight: isFullscreen.value ? 'calc(100vh - 44px)' : 520,
}));

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}
</script>

<template>
  <ClientOnly>
    <div
      class="playground-wrapper"
      :class="{ 'hide-editor': !showCode, 'is-fullscreen': isFullscreen }"
    >
      <div class="playground-toolbar">
        <button class="toolbar-btn" @click="showCode = !showCode">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
          {{ showCode ? 'Hide Code' : 'Show Code' }}
        </button>
        <button class="toolbar-btn" @click="toggleFullscreen">
          <svg v-if="!isFullscreen" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 14h6v6m10-10h-6V4m0 6 7-7M3 21l7-7" />
          </svg>
          {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
        </button>
      </div>
      <Sandpack
        template="vanilla-ts"
        :theme="isDark ? 'dark' : 'light'"
        :files="files"
        :custom-setup="customSetup"
        :options="sandpackOptions"
      />
    </div>
  </ClientOnly>
</template>

<style scoped>
.playground-wrapper {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.playground-wrapper.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1000;
  margin: 0;
  border-radius: 0;
  border: none;
  background: var(--vp-c-bg);
}

.playground-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* Hide editor: target .sp-editor which has both sp-editor and sp-stack classes */
.playground-wrapper.hide-editor :deep(.sp-editor) {
  display: none !important;
}

/* When editor hidden, the remaining panel (preview) should take full width */
.playground-wrapper.hide-editor :deep(.sp-stack:not(.sp-editor)) {
  flex: 1 1 100% !important;
  max-width: 100% !important;
  width: 100% !important;
}

/* Target common sandpack wrapper/layout containers */
.playground-wrapper.hide-editor :deep([class*="sp-layout"]),
.playground-wrapper.hide-editor :deep([class*="sp-wrapper"]) > div {
  display: flex !important;
}

/* Fullscreen: maximize height */
.playground-wrapper.is-fullscreen :deep([class*="sp-layout"]),
.playground-wrapper.is-fullscreen :deep(.sp-wrapper) {
  height: calc(100vh - 44px) !important;
}

.playground-wrapper.is-fullscreen :deep(.sp-stack) {
  height: 100% !important;
}

.playground-wrapper.is-fullscreen :deep(iframe) {
  height: 100% !important;
}
</style>
