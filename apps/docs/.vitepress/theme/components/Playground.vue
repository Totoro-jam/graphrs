<script setup lang="ts">
import { Sandpack } from 'sandpack-vue3';
import { useData } from 'vitepress';
import { computed } from 'vue';

const props = defineProps<{ code: string }>();
const { isDark } = useData();

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
      const idx = neighbors.indexOf(id);
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
    const g = new Graph(options);
    for (const e of edges) g.addEdge(e[0], e[1]);
    return g;
  }
}
`;

const zoomPanCode = `
export function enableZoomPan(canvas, drawFn) {
  let scale = 1, offsetX = 0, offsetY = 0;
  let dragging = false, lastX = 0, lastY = 0;

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    offsetX = mx - (mx - offsetX) * zoom;
    offsetY = my - (my - offsetY) * zoom;
    scale *= zoom;
    drawFn(scale, offsetX, offsetY);
  }, { passive: false });

  canvas.addEventListener('mousedown', (e) => {
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
  canvas.style.cursor = 'grab';

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
  '/index.html': {
    code: '<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8" /><title>graphrs</title></head>\n<body style="margin:0;overflow:hidden">\n  <div id="app" style="width:100vw;height:100vh"></div>\n  <script type="module" src="./index.ts"><\/script>\n</body>\n</html>',
    hidden: true,
  },
}));

const customSetup = {
  dependencies: {},
};
</script>

<template>
  <ClientOnly>
    <div class="playground-wrapper">
      <Sandpack
        template="vanilla-ts"
        :theme="isDark ? 'dark' : 'light'"
        :files="files"
        :custom-setup="customSetup"
        :options="{
          showConsole: true,
          showConsoleButton: true,
          editorHeight: 560,
          layout: 'preview',
        }"
      />
    </div>
  </ClientOnly>
</template>

<style scoped>
.playground-wrapper {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
}
</style>
