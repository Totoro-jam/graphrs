<script setup>
const animatedBFS = `import { Graph } from '@graphrs/core';

// Build a 200-node scale-free network
function barabasiAlbert(n: number, m: number): Graph {
  const edges: [number, number][] = [];
  const degree: number[] = new Array(n).fill(0);
  for (let i = 0; i <= m; i++) {
    for (let j = i + 1; j <= m; j++) {
      edges.push([i, j]); degree[i]++; degree[j]++;
    }
  }
  for (let i = m + 1; i < n; i++) {
    const targets = new Set<number>();
    const total = degree.reduce((a, b) => a + b, 0);
    while (targets.size < m) {
      let r = Math.random() * total;
      for (let j = 0; j < i; j++) {
        r -= degree[j];
        if (r <= 0) { targets.add(j); break; }
      }
    }
    for (const t of targets) {
      edges.push([i, t]); degree[i]++; degree[t]++;
    }
  }
  return Graph.fromEdges(edges);
}

// Force-directed layout
function layout(graph: Graph) {
  const nodes = graph.nodes();
  const n = nodes.length;
  const W = 780, H = 480;
  const k = Math.sqrt((W * H) / n);
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [Math.random() * W, Math.random() * H];
  let temp = W / 4;
  for (let iter = 0; iter < 100; iter++) {
    const disp: Record<number, [number, number]> = {};
    for (const v of nodes) disp[v] = [0, 0];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const vi = nodes[i], vj = nodes[j];
        const dx = pos[vi][0] - pos[vj][0], dy = pos[vi][1] - pos[vj][1];
        const dist = Math.max(Math.sqrt(dx*dx + dy*dy), 0.1);
        const f = (k * k) / dist;
        disp[vi][0] += (dx/dist)*f; disp[vi][1] += (dy/dist)*f;
        disp[vj][0] -= (dx/dist)*f; disp[vj][1] -= (dy/dist)*f;
      }
    }
    for (const e of graph.edges()) {
      const dx = pos[e.source][0]-pos[e.target][0];
      const dy = pos[e.source][1]-pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx*dx+dy*dy), 0.1);
      const f = (dist*dist)/k;
      disp[e.source][0] -= (dx/dist)*f; disp[e.source][1] -= (dy/dist)*f;
      disp[e.target][0] += (dx/dist)*f; disp[e.target][1] += (dy/dist)*f;
    }
    for (const v of nodes) {
      const d = Math.max(Math.sqrt(disp[v][0]**2 + disp[v][1]**2), 0.1);
      pos[v][0] = Math.max(30, Math.min(W-30, pos[v][0] + (disp[v][0]/d)*Math.min(d, temp)));
      pos[v][1] = Math.max(30, Math.min(H-30, pos[v][1] + (disp[v][1]/d)*Math.min(d, temp)));
    }
    temp *= 0.95;
  }
  return pos;
}

const graph = barabasiAlbert(200, 3);
console.log('Graph: ' + graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges');

const pos = layout(graph);
const degrees: Record<number, number> = {};
for (const id of graph.nodes()) degrees[id] = graph.degree(id);
const maxDeg = Math.max(...Object.values(degrees));

// Setup canvas
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="800" height="500" style="background:#0a0a1a;border-radius:12px;display:block;width:100%;aspect-ratio:8/5"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Animated BFS from the highest-degree node
const startNode = Number(Object.entries(degrees).sort((a,b) => b[1]-a[1])[0][0]);
const visited = new Set<number>();
const layers: number[][] = [];
let frontier = [startNode];
visited.add(startNode);
while (frontier.length > 0) {
  layers.push([...frontier]);
  const next: number[] = [];
  for (const node of frontier) {
    for (const nb of graph.neighbors(node)) {
      if (!visited.has(nb)) { visited.add(nb); next.push(nb); }
    }
  }
  frontier = next;
}

const layerColors = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#00d2d3'];
const nodeColor: Record<number, string> = {};
layers.forEach((layer, i) => {
  for (const id of layer) nodeColor[id] = layerColors[i % layerColors.length];
});

console.log('BFS from hub node ' + startNode + ' (degree ' + degrees[startNode] + ')');
console.log('Layers: ' + layers.length + ', reached ' + visited.size + ' nodes');

// Animate layer by layer
let currentLayer = 0;
const revealedNodes = new Set<number>();
const revealedEdges = new Set<string>();

function draw() {
  ctx.clearRect(0, 0, 800, 500);
  for (const key of revealedEdges) {
    const [a, b] = key.split('-').map(Number);
    ctx.beginPath();
    ctx.moveTo(pos[a][0], pos[a][1]);
    ctx.lineTo(pos[b][0], pos[b][1]);
    ctx.strokeStyle = 'rgba(100, 160, 255, 0.12)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
  for (const id of revealedNodes) {
    const [x, y] = pos[id];
    const r = 2 + (degrees[id] / maxDeg) * 7;
    const color = nodeColor[id] || '#666';
    ctx.beginPath();
    ctx.arc(x, y, r + 3, 0, Math.PI * 2);
    ctx.fillStyle = color + '20';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.fillStyle = '#ccc';
  ctx.font = '13px monospace';
  ctx.fillText('BFS Layer: ' + Math.min(currentLayer, layers.length) + '/' + layers.length + '  |  Nodes: ' + revealedNodes.size + '/' + graph.nodeCount(), 12, 20);
}

function animateStep() {
  if (currentLayer >= layers.length) { draw(); return; }
  const layer = layers[currentLayer];
  for (const id of layer) {
    revealedNodes.add(id);
    for (const nb of graph.neighbors(id)) {
      if (revealedNodes.has(nb)) {
        revealedEdges.add(Math.min(id,nb) + '-' + Math.max(id,nb));
      }
    }
  }
  currentLayer++;
  draw();
  setTimeout(animateStep, 180);
}
animateStep();
`;

const communityViz = `import { Graph } from '@graphrs/core';

// Graph with 5 planted communities (150 nodes)
function makeCommunityGraph(): Graph {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  const sizes = [35, 30, 28, 32, 25];
  let offset = 0;
  for (const size of sizes) {
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        if (Math.random() < 0.5) {
          const a = offset + i, b = offset + j;
          seen.add(a + '-' + b);
          edges.push([a, b]);
        }
      }
    }
    offset += size;
  }
  // Sparse bridges between communities
  offset = 0;
  const offsets = [0];
  for (const s of sizes) { offset += s; offsets.push(offset); }
  for (let c = 0; c < sizes.length - 1; c++) {
    for (let k = 0; k < 3; k++) {
      const a = offsets[c] + Math.floor(Math.random() * sizes[c]);
      const b = offsets[c+1] + Math.floor(Math.random() * sizes[c+1]);
      if (!seen.has(a + '-' + b)) { seen.add(a + '-' + b); edges.push([a, b]); }
    }
  }
  return Graph.fromEdges(edges);
}

// Label Propagation community detection
function detectCommunities(graph: Graph): Map<number, number> {
  const nodes = graph.nodes();
  const labels = new Map<number, number>();
  for (const id of nodes) labels.set(id, id);
  for (let iter = 0; iter < 50; iter++) {
    let changed = false;
    const order = [...nodes].sort(() => Math.random() - 0.5);
    for (const node of order) {
      const nbs = graph.neighbors(node);
      if (nbs.length === 0) continue;
      const counts = new Map<number, number>();
      for (const nb of nbs) {
        const l = labels.get(nb)!;
        counts.set(l, (counts.get(l) || 0) + 1);
      }
      let best = labels.get(node)!, max = 0;
      for (const [l, c] of counts) { if (c > max) { max = c; best = l; } }
      if (best !== labels.get(node)) { labels.set(node, best); changed = true; }
    }
    if (!changed) break;
  }
  return labels;
}

// Force layout
function forceLayout(graph: Graph) {
  const nodes = graph.nodes();
  const n = nodes.length;
  const W = 780, H = 480;
  const k = Math.sqrt((W * H) / n);
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [Math.random() * W, Math.random() * H];
  let temp = W / 4;
  for (let iter = 0; iter < 80; iter++) {
    const disp: Record<number, [number, number]> = {};
    for (const v of nodes) disp[v] = [0, 0];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const vi = nodes[i], vj = nodes[j];
        const dx = pos[vi][0]-pos[vj][0], dy = pos[vi][1]-pos[vj][1];
        const dist = Math.max(Math.sqrt(dx*dx+dy*dy), 0.1);
        const f = (k*k)/dist;
        disp[vi][0] += (dx/dist)*f; disp[vi][1] += (dy/dist)*f;
        disp[vj][0] -= (dx/dist)*f; disp[vj][1] -= (dy/dist)*f;
      }
    }
    for (const e of graph.edges()) {
      const dx = pos[e.source][0]-pos[e.target][0];
      const dy = pos[e.source][1]-pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx*dx+dy*dy), 0.1);
      const f = (dist*dist)/k;
      disp[e.source][0] -= (dx/dist)*f; disp[e.source][1] -= (dy/dist)*f;
      disp[e.target][0] += (dx/dist)*f; disp[e.target][1] += (dy/dist)*f;
    }
    for (const v of nodes) {
      const d = Math.max(Math.sqrt(disp[v][0]**2+disp[v][1]**2), 0.1);
      pos[v][0] = Math.max(25, Math.min(W-25, pos[v][0]+(disp[v][0]/d)*Math.min(d,temp)));
      pos[v][1] = Math.max(25, Math.min(H-25, pos[v][1]+(disp[v][1]/d)*Math.min(d,temp)));
    }
    temp *= 0.94;
  }
  return pos;
}

const graph = makeCommunityGraph();
const labels = detectCommunities(graph);
const pos = forceLayout(graph);

const commMap = new Map<number, number[]>();
for (const [node, lbl] of labels) {
  if (!commMap.has(lbl)) commMap.set(lbl, []);
  commMap.get(lbl)!.push(node);
}
console.log('Nodes:', graph.nodeCount(), '| Edges:', graph.edgeCount());
console.log('Communities detected:', commMap.size);
[...commMap.entries()]
  .sort((a,b) => b[1].length - a[1].length)
  .slice(0, 8)
  .forEach(([lbl, members], i) => console.log('  Community ' + (i+1) + ': ' + members.length + ' nodes'));

// Render
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="800" height="500" style="background:#06061a;border-radius:12px;display:block;width:100%;aspect-ratio:8/5"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const palette = ['#ff6b6b','#4ecdc4','#45b7d1','#feca57','#a29bfe','#fd79a8','#00b894','#e17055','#0984e3','#6c5ce7'];
const commColor = new Map<number, string>();
let ci = 0;
for (const [lbl] of [...commMap.entries()].sort((a,b) => b[1].length - a[1].length)) {
  commColor.set(lbl, palette[ci % palette.length]);
  ci++;
}

for (const e of graph.edges()) {
  const sameComm = labels.get(e.source) === labels.get(e.target);
  const color = sameComm ? commColor.get(labels.get(e.source)!) || '#444' : '#222';
  ctx.beginPath();
  ctx.moveTo(pos[e.source][0], pos[e.source][1]);
  ctx.lineTo(pos[e.target][0], pos[e.target][1]);
  ctx.strokeStyle = color + (sameComm ? '35' : '50');
  ctx.lineWidth = sameComm ? 0.8 : 0.4;
  ctx.stroke();
}

for (const id of graph.nodes()) {
  const [x, y] = pos[id];
  const color = commColor.get(labels.get(id)!) || '#666';
  const deg = graph.degree(id);
  const r = 2.5 + (deg / 20) * 4;
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r + 6);
  grad.addColorStop(0, color + '40');
  grad.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.arc(x, y, r + 6, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

ctx.fillStyle = '#bbb';
ctx.font = '13px monospace';
ctx.fillText(commMap.size + ' communities · ' + graph.nodeCount() + ' nodes · Label Propagation', 12, 20);
`;

const centralityViz = `import { Graph } from '@graphrs/core';

// Social network with bridge structure (100 nodes, 5 clusters)
function buildNetwork(): Graph {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  const add = (a: number, b: number) => {
    const k = Math.min(a,b)+'-'+Math.max(a,b);
    if (a !== b && !seen.has(k)) { seen.add(k); edges.push([a, b]); }
  };
  for (let c = 0; c < 5; c++) {
    const base = c * 20;
    for (let i = 0; i < 20; i++) {
      for (let j = i+1; j < 20; j++) {
        if (Math.random() < 0.35) add(base+i, base+j);
      }
    }
  }
  add(10, 20); add(18, 40); add(30, 60); add(50, 80);
  add(15, 35); add(55, 75); add(38, 62); add(72, 8);
  return Graph.fromEdges(edges);
}

// Betweenness centrality (Brandes algorithm)
function betweenness(graph: Graph): Map<number, number> {
  const nodes = graph.nodes();
  const cb = new Map<number, number>();
  for (const v of nodes) cb.set(v, 0);
  for (const s of nodes) {
    const stack: number[] = [];
    const pred = new Map<number, number[]>();
    const sigma = new Map<number, number>();
    const dist = new Map<number, number>();
    for (const v of nodes) { pred.set(v, []); sigma.set(v, 0); dist.set(v, -1); }
    sigma.set(s, 1); dist.set(s, 0);
    const queue = [s];
    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      for (const w of graph.neighbors(v)) {
        if (dist.get(w)! < 0) { queue.push(w); dist.set(w, dist.get(v)! + 1); }
        if (dist.get(w) === dist.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          pred.get(w)!.push(v);
        }
      }
    }
    const delta = new Map<number, number>();
    for (const v of nodes) delta.set(v, 0);
    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of pred.get(w)!) {
        delta.set(v, delta.get(v)! + (sigma.get(v)!/sigma.get(w)!) * (1+delta.get(w)!));
      }
      if (w !== s) cb.set(w, cb.get(w)! + delta.get(w)!);
    }
  }
  const maxCb = Math.max(...cb.values(), 1);
  for (const [k, v] of cb) cb.set(k, v / maxCb);
  return cb;
}

const graph = buildNetwork();
console.log('Network: ' + graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges');
const bc = betweenness(graph);

const sorted = [...bc.entries()].sort((a,b) => b[1]-a[1]);
console.log('\\nTop 10 bridge nodes:');
sorted.slice(0, 10).forEach(([id, score], i) =>
  console.log('  #' + (i+1) + ' Node ' + id + ' → centrality: ' + score.toFixed(4))
);

const g6Data = graph.toG6Format();
console.log('\\nG6 Format: ' + g6Data.nodes.length + ' nodes, ' + g6Data.edges.length + ' edges');

// Render with circular cluster layout
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="800" height="500" style="background:#0a0e1a;border-radius:12px;display:block;width:100%;aspect-ratio:8/5"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const nodes = graph.nodes();
const pos: Record<number, [number, number]> = {};
const centers: [number,number][] = [[200,150],[600,150],[400,250],[200,380],[600,380]];
for (let c = 0; c < 5; c++) {
  const [cx, cy] = centers[c];
  for (let i = 0; i < 20; i++) {
    const id = c * 20 + i;
    if (!nodes.includes(id)) continue;
    const angle = (i / 20) * Math.PI * 2;
    const r = 55 + Math.random() * 25;
    pos[id] = [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  }
}

for (const e of graph.edges()) {
  if (!pos[e.source] || !pos[e.target]) continue;
  const isBridge = (bc.get(e.source) || 0) > 0.3 || (bc.get(e.target) || 0) > 0.3;
  ctx.beginPath();
  ctx.moveTo(pos[e.source][0], pos[e.source][1]);
  ctx.lineTo(pos[e.target][0], pos[e.target][1]);
  ctx.strokeStyle = isBridge ? 'rgba(255,107,107,0.25)' : 'rgba(80,140,240,0.08)';
  ctx.lineWidth = isBridge ? 1.2 : 0.5;
  ctx.stroke();
}

const clusterColors = ['#4ecdc4','#45b7d1','#feca57','#a29bfe','#ff6b6b'];
for (const id of nodes) {
  if (!pos[id]) continue;
  const [x, y] = pos[id];
  const score = bc.get(id) || 0;
  const cluster = Math.floor(id / 20);
  const r = 3 + score * 14;
  if (score > 0.2) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r + 10);
    grad.addColorStop(0, '#ff6b6b60');
    grad.addColorStop(1, '#ff6b6b00');
    ctx.beginPath();
    ctx.arc(x, y, r + 10, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = score > 0.3 ? '#ff6b6b' : score > 0.1 ? '#feca57' : clusterColors[cluster] || '#4ecdc4';
  ctx.fill();
}

ctx.fillStyle = '#bbb';
ctx.font = '13px monospace';
ctx.fillText('Betweenness Centrality · Bridge nodes in red · 5 clusters', 12, 20);
`;

const pageRankViz = `import { Graph } from '@graphrs/core';

// Web-like directed graph (250 nodes)
function webGraph(n: number): Graph {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  for (let cluster = 0; cluster < 5; cluster++) {
    const base = cluster * (n/5);
    const size = Math.floor(n/5);
    for (let i = 0; i < size; i++) {
      const from = Math.floor(base + i);
      for (let t = 0; t < 2 + Math.floor(Math.random()*3); t++) {
        const to = Math.floor(base + Math.random() * size);
        const k = from + '-' + to;
        if (from !== to && !seen.has(k)) { seen.add(k); edges.push([from, to]); }
      }
    }
  }
  for (let i = 0; i < n/8; i++) {
    const from = Math.floor(Math.random() * n);
    const to = Math.floor(Math.random() * n);
    const k = from + '-' + to;
    if (from !== to && !seen.has(k)) { seen.add(k); edges.push([from, to]); }
  }
  return Graph.fromEdges(edges, { directed: true });
}

// PageRank with dangling node handling
function pageRank(graph: Graph, d = 0.85, iter = 40): Map<number, number> {
  const nodes = graph.nodes();
  const n = nodes.length;
  const outDeg = new Map<number, number>();
  const inLinks = new Map<number, number[]>();
  for (const id of nodes) { outDeg.set(id, 0); inLinks.set(id, []); }
  for (const e of graph.edges()) {
    outDeg.set(e.source, (outDeg.get(e.source) || 0) + 1);
    inLinks.get(e.target)!.push(e.source);
  }
  let rank = new Map<number, number>();
  for (const id of nodes) rank.set(id, 1/n);
  for (let i = 0; i < iter; i++) {
    let danglingSum = 0;
    for (const id of nodes) {
      if ((outDeg.get(id) || 0) === 0) danglingSum += rank.get(id)!;
    }
    const nr = new Map<number, number>();
    for (const id of nodes) {
      let sum = 0;
      for (const src of inLinks.get(id)!) {
        sum += (rank.get(src) || 0) / (outDeg.get(src) || 1);
      }
      nr.set(id, (1-d)/n + d * (sum + danglingSum/n));
    }
    rank = nr;
  }
  return rank;
}

const graph = webGraph(250);
console.log('Web graph: ' + graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges');
const ranks = pageRank(graph);

const sorted = [...ranks.entries()].sort((a,b) => b[1]-a[1]);
console.log('\\nTop 15 pages by PageRank:');
sorted.slice(0,15).forEach(([id, r], i) =>
  console.log('  #' + (i+1) + ' Page ' + id + ': ' + r.toFixed(6))
);

// Force layout + render
const nodes = graph.nodes();
const n = nodes.length;
const W = 780, H = 480;
const k = Math.sqrt(W*H/n) * 0.7;
const pos: Record<number, [number, number]> = {};
for (const id of nodes) pos[id] = [Math.random()*W, Math.random()*H];
let temp = 150;
for (let iter = 0; iter < 60; iter++) {
  const disp: Record<number, [number, number]> = {};
  for (const v of nodes) disp[v] = [0, 0];
  for (let i = 0; i < n; i++) {
    for (let j = i+1; j < n; j++) {
      const vi = nodes[i], vj = nodes[j];
      const dx = pos[vi][0]-pos[vj][0], dy = pos[vi][1]-pos[vj][1];
      const dist = Math.max(Math.sqrt(dx*dx+dy*dy), 0.5);
      const f = (k*k)/dist * 0.4;
      disp[vi][0] += (dx/dist)*f; disp[vi][1] += (dy/dist)*f;
      disp[vj][0] -= (dx/dist)*f; disp[vj][1] -= (dy/dist)*f;
    }
  }
  for (const e of graph.edges()) {
    const dx = pos[e.source][0]-pos[e.target][0];
    const dy = pos[e.source][1]-pos[e.target][1];
    const dist = Math.max(Math.sqrt(dx*dx+dy*dy), 0.5);
    const f = (dist*dist)/k * 0.3;
    disp[e.source][0] -= (dx/dist)*f; disp[e.source][1] -= (dy/dist)*f;
    disp[e.target][0] += (dx/dist)*f; disp[e.target][1] += (dy/dist)*f;
  }
  for (const v of nodes) {
    const d = Math.max(Math.sqrt(disp[v][0]**2+disp[v][1]**2), 0.1);
    pos[v][0] = Math.max(30, Math.min(W-30, pos[v][0]+(disp[v][0]/d)*Math.min(d,temp)));
    pos[v][1] = Math.max(30, Math.min(H-30, pos[v][1]+(disp[v][1]/d)*Math.min(d,temp)));
  }
  temp *= 0.93;
}

const maxRank = sorted[0][1];
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="800" height="500" style="background:#08081c;border-radius:12px;display:block;width:100%;aspect-ratio:8/5"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

for (const e of graph.edges()) {
  ctx.beginPath();
  ctx.moveTo(pos[e.source][0], pos[e.source][1]);
  ctx.lineTo(pos[e.target][0], pos[e.target][1]);
  ctx.strokeStyle = 'rgba(60,120,200,0.06)';
  ctx.lineWidth = 0.4;
  ctx.stroke();
}

for (const id of nodes) {
  const [x, y] = pos[id];
  const r_val = ranks.get(id) || 0;
  const norm = r_val / maxRank;
  const r = 1.5 + norm * 12;
  if (norm > 0.3) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r + 8);
    grad.addColorStop(0, 'rgba(255,200,80,0.4)');
    grad.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.beginPath();
    ctx.arc(x, y, r + 8, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  const hue = 200 + norm * 40;
  ctx.fillStyle = norm > 0.5 ? '#feca57' : norm > 0.2 ? '#48dbfb' : 'hsl(' + hue + ', 60%, 45%)';
  ctx.fill();
}

ctx.fillStyle = '#bbb';
ctx.font = '13px monospace';
ctx.fillText('PageRank · ' + graph.nodeCount() + ' nodes · High-rank pages in gold', 12, 20);
`;
</script>

# 交互式演练场

编辑代码，即时查看结果。每个 Demo 都在 `@graphrs/core` 的实时沙箱中运行**真实图算法**。

## 动画 BFS 遍历

观察 BFS 在 200 节点无标度网络中逐层扩展。度数高的枢纽节点更大；颜色表示 BFS 层深度：

<Playground :code="animatedBFS" />

## 社区发现

使用标签传播算法在 150 节点图上检测社区。力导向布局自然分离出集群，颜色对应检测到的社区：

<Playground :code="communityViz" />

## 介数中心性与桥接节点检测

识别 5 集群社交网络中的关键桥接节点。红色发光节点具有高介数中心性 — 移除它们会导致社区断裂：

<Playground :code="centralityViz" />

## 网页图 PageRank

在 250 节点有向网页图上计算 PageRank。金色节点具有最高权威分数，大小与排名成正比：

<Playground :code="pageRankViz" />
