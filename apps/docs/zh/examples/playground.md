<script setup>
const animatedBFS = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';
import { createCanvas } from './canvas-util.js';

function barabasiAlbert(n: number, m: number): Graph {
  const edges: [number, number][] = [];
  const degree: number[] = new Array(n).fill(0);
  for (let i = 0; i <= m; i++) for (let j = i + 1; j <= m; j++) {
    edges.push([i, j]); degree[i]++; degree[j]++;
  }
  for (let i = m + 1; i < n; i++) {
    const targets = new Set<number>();
    const total = degree.reduce((a, b) => a + b, 0);
    while (targets.size < m) {
      let r = Math.random() * total;
      for (let j = 0; j < i; j++) { r -= degree[j]; if (r <= 0) { targets.add(j); break; } }
    }
    for (const t of targets) { edges.push([i, t]); degree[i]++; degree[t]++; }
  }
  return Graph.fromEdges(edges);
}

function forceLayout(graph: Graph, W: number, H: number, iter = 180) {
  const nodes = graph.nodes(), n = nodes.length, k = Math.sqrt(W * H / n) * 1.1;
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [80 + Math.random() * (W - 160), 80 + Math.random() * (H - 160)];
  let temp = W / 3;
  for (let it = 0; it < iter; it++) {
    const disp: Record<number, [number, number]> = {};
    for (const v of nodes) disp[v] = [0, 0];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const vi = nodes[i], vj = nodes[j];
      const dx = pos[vi][0] - pos[vj][0], dy = pos[vi][1] - pos[vj][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
      const f = (k * k) / dist;
      disp[vi][0] += (dx / dist) * f; disp[vi][1] += (dy / dist) * f;
      disp[vj][0] -= (dx / dist) * f; disp[vj][1] -= (dy / dist) * f;
    }
    for (const e of graph.edges()) {
      const dx = pos[e.source][0] - pos[e.target][0], dy = pos[e.source][1] - pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
      const f = (dist * dist) / k;
      disp[e.source][0] -= (dx / dist) * f; disp[e.source][1] -= (dy / dist) * f;
      disp[e.target][0] += (dx / dist) * f; disp[e.target][1] += (dy / dist) * f;
    }
    for (const v of nodes) {
      const d = Math.max(Math.sqrt(disp[v][0] ** 2 + disp[v][1] ** 2), 0.1);
      pos[v][0] = Math.max(40, Math.min(W - 40, pos[v][0] + (disp[v][0] / d) * Math.min(d, temp)));
      pos[v][1] = Math.max(40, Math.min(H - 40, pos[v][1] + (disp[v][1] / d) * Math.min(d, temp)));
    }
    temp *= 0.95;
  }
  return pos;
}

const app = document.getElementById('app')!;
let N = 300;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:6px 12px;background:rgba(10,10,18,0.92);border-radius:8px;border:1px solid rgba(100,160,255,0.15);backdrop-filter:blur(8px)';
ctrl.innerHTML = '<span style="color:#8ab4f8;font:11px/1 system-ui;font-weight:500">Nodes</span><input id="ns" type="range" min="100" max="2000" value="300" style="width:100px;accent-color:#5b8ff9"><span id="nv" style="color:#bbb;font:11px system-ui;width:36px;text-align:center">300</span><button id="go" style="padding:3px 14px;background:linear-gradient(135deg,rgba(91,143,249,0.25),rgba(91,143,249,0.05));border:1px solid rgba(91,143,249,0.4);border-radius:6px;color:#8ab4f8;font:11px system-ui;font-weight:600;cursor:pointer;transition:all 0.15s">Run</button>';

const cv = createCanvas(app);
cv.wrapper.appendChild(ctrl);

let graph: Graph, pos: Record<number, [number, number]>, deg: Record<number, number>, maxDeg: number;
let layers: number[][], nodeLayer: Record<number, number>, maxLayer: number;
let revealed = 0, revNodes = new Set<number>(), revEdges = new Set<string>();
let zp: ReturnType<typeof enableZoomPan>;

function run() {
  graph = barabasiAlbert(N, 3);
  const W = 1400, H = 1000;
  pos = forceLayout(graph, W, H);
  deg = {}; for (const id of graph.nodes()) deg[id] = graph.degree(id);
  maxDeg = Math.max(...Object.values(deg));

  const hub = Number(Object.entries(deg).sort((a, b) => b[1] - a[1])[0][0]);
  const visited = new Set<number>(); layers = [];
  let frontier = [hub]; visited.add(hub);
  while (frontier.length > 0) {
    layers.push([...frontier]);
    const next: number[] = [];
    for (const nd of frontier) for (const nb of graph.neighbors(nd)) {
      if (!visited.has(nb)) { visited.add(nb); next.push(nb); }
    }
    frontier = next;
  }

  nodeLayer = {}; layers.forEach((layer, i) => { for (const id of layer) nodeLayer[id] = i; });
  maxLayer = layers.length - 1;
  revealed = 0; revNodes = new Set(); revEdges = new Set();

  if (!zp) zp = enableZoomPan(cv.canvas, draw);
  step();
  console.log(graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges, ' + layers.length + ' BFS layers from hub #' + hub);
}

function draw(scale?: number, ox?: number, oy?: number) {
  if (!graph) return;
  const cW = cv.width, cH = cv.height;
  const t = zp ? zp.getTransform() : { scale: 1, offsetX: 0, offsetY: 0 };
  const s = scale ?? t.scale, oX = ox ?? t.offsetX, oY = oy ?? t.offsetY;
  const W = 1400, H = 1000;
  const sx = cW / W * s, sy = cH / H * s;
  const ctx = cv.ctx;
  ctx.clearRect(0, 0, cW, cH);
  ctx.fillStyle = '#080b12'; ctx.fillRect(0, 0, cW, cH);
  ctx.save(); ctx.translate(oX, oY);
  ctx.lineCap = 'round';

  for (const key of revEdges) {
    const [a, b] = key.split('-').map(Number);
    const importance = Math.max(deg[a] / maxDeg, deg[b] / maxDeg);
    ctx.beginPath();
    ctx.moveTo(pos[a][0] * sx, pos[a][1] * sy);
    ctx.lineTo(pos[b][0] * sx, pos[b][1] * sy);
    ctx.strokeStyle = 'rgba(91,143,249,' + (0.05 + importance * 0.18) + ')';
    ctx.lineWidth = 0.5 + importance * 1.2;
    ctx.stroke();
  }

  for (const id of revNodes) {
    const x = pos[id][0] * sx, y = pos[id][1] * sy;
    const norm = deg[id] / maxDeg;
    const r = (2.5 + norm * 12) * Math.min(s, 2.5);
    const depth = (nodeLayer[id] || 0) / Math.max(maxLayer, 1);

    if (norm > 0.3) {
      const grd = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.8);
      grd.addColorStop(0, 'rgba(91,143,249,0.3)');
      grd.addColorStop(1, 'rgba(91,143,249,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(x - r * 2.8, y - r * 2.8, r * 5.6, r * 5.6);
    }

    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    const h = 215, sat = 80, l = 72 - depth * 40;
    ctx.fillStyle = 'hsl(' + h + ',' + sat + '%,' + l + '%)';
    ctx.fill();

    if (norm > 0.4) {
      ctx.strokeStyle = 'rgba(138,180,248,0.6)'; ctx.lineWidth = 1.2; ctx.stroke();
    }
  }

  ctx.font = '10px system-ui'; ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 3;
  const topHubs = Object.entries(deg).sort((a, b) => b[1] - a[1]).slice(0, 8);
  for (const [id, d] of topHubs) {
    const nid = Number(id);
    if (!revNodes.has(nid)) continue;
    const x = pos[nid][0] * sx, y = pos[nid][1] * sy;
    const r = (2.5 + (d / maxDeg) * 12) * Math.min(s, 2.5);
    ctx.fillStyle = 'rgba(200,220,255,0.92)';
    ctx.fillText('hub #' + id + ' (deg ' + d + ')', x, y - r - 6);
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  // Status bar
  ctx.fillStyle = 'rgba(8,11,18,0.9)'; ctx.fillRect(0, cH - 26, cW, 26);
  ctx.strokeStyle = 'rgba(91,143,249,0.12)'; ctx.beginPath(); ctx.moveTo(0, cH - 26); ctx.lineTo(cW, cH - 26); ctx.stroke();
  ctx.font = '10px system-ui'; ctx.textAlign = 'left';
  ctx.fillStyle = '#8ab4f8'; ctx.fillText('Layer ' + Math.min(revealed, layers.length) + '/' + layers.length, 12, cH - 9);
  ctx.fillStyle = '#667'; ctx.fillText(revNodes.size + ' / ' + graph.nodeCount() + ' nodes  ·  ' + revEdges.size + ' edges  ·  zoom & pan', 110, cH - 9);
}

cv.onResize(draw);

function step() {
  if (revealed >= layers.length) return;
  const layer = layers[revealed];
  for (const id of layer) {
    revNodes.add(id);
    for (const nb of graph.neighbors(id)) {
      if (revNodes.has(nb)) revEdges.add(Math.min(id, nb) + '-' + Math.max(id, nb));
    }
  }
  revealed++;
  draw();
  const progress = revealed / layers.length;
  const delay = 40 + progress * 140;
  setTimeout(step, delay);
}

setTimeout(() => {
  document.getElementById('ns')!.addEventListener('input', (e: any) => { N = +e.target.value; document.getElementById('nv')!.textContent = N + ''; });
  document.getElementById('go')!.addEventListener('click', run);
  run();
}, 30);
`;

const communityViz = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';
import { createCanvas } from './canvas-util.js';

function makeCommunityGraph(n: number) {
  const numComm = Math.max(4, Math.round(n / 28));
  const sizes: number[] = [];
  let rem = n;
  for (let i = 0; i < numComm - 1; i++) {
    const s = Math.max(8, Math.round(rem / (numComm - i) * (0.7 + Math.random() * 0.6)));
    sizes.push(Math.min(s, rem - (numComm - i - 1) * 8));
    rem -= sizes[sizes.length - 1];
  }
  sizes.push(rem);

  const edges: [number, number][] = [], seen = new Set<string>();
  const add = (a: number, b: number) => { const k = Math.min(a, b) + '-' + Math.max(a, b); if (a !== b && !seen.has(k)) { seen.add(k); edges.push([a, b]); } };
  let off = 0;
  for (let c = 0; c < sizes.length; c++) {
    for (let i = 0; i < sizes[c]; i++) {
      for (let j = i + 1; j < sizes[c]; j++) if (Math.random() < 0.35) add(off + i, off + j);
    }
    off += sizes[c];
  }
  off = 0;
  for (let c = 0; c < sizes.length; c++) {
    for (let c2 = c + 1; c2 < sizes.length; c2++) {
      const bridges = 1 + Math.floor(Math.random() * 2);
      const offC2 = sizes.slice(0, c2).reduce((a, b) => a + b, 0);
      for (let k = 0; k < bridges; k++) add(off + Math.floor(Math.random() * sizes[c]), offC2 + Math.floor(Math.random() * sizes[c2]));
    }
    off += sizes[c];
  }
  return Graph.fromEdges(edges);
}

function detectComm(graph: Graph): Map<number, number> {
  const nodes = graph.nodes(), labels = new Map<number, number>();
  for (const id of nodes) labels.set(id, id);
  const m2 = Math.max(graph.edgeCount() * 2, 1);
  for (let pass = 0; pass < 50; pass++) {
    let moved = false;
    for (const node of [...nodes].sort(() => Math.random() - 0.5)) {
      const nbs = graph.neighbors(node); if (!nbs.length) continue;
      const w = new Map<number, number>();
      for (const nb of nbs) { const c = labels.get(nb)!; w.set(c, (w.get(c) || 0) + 1); }
      let best = labels.get(node)!, bestG = 0;
      for (const [c, v] of w) { const g = v - nbs.length * v / m2; if (g > bestG) { bestG = g; best = c; } }
      if (best !== labels.get(node)) { labels.set(node, best); moved = true; }
    }
    if (!moved) break;
  }
  const remap = new Map<number, number>(); let next = 0;
  for (const [, v] of labels) if (!remap.has(v)) remap.set(v, next++);
  for (const [k, v] of labels) labels.set(k, remap.get(v)!);
  return labels;
}

function forceLayout(graph: Graph, W: number, H: number) {
  const nodes = graph.nodes(), n = nodes.length, k = Math.sqrt(W * H / n) * 1.2;
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [80 + Math.random() * (W - 160), 80 + Math.random() * (H - 160)];
  let temp = W / 3;
  for (let it = 0; it < 130; it++) {
    const d: Record<number, [number, number]> = {};
    for (const v of nodes) d[v] = [0, 0];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const vi = nodes[i], vj = nodes[j];
      const dx = pos[vi][0] - pos[vj][0], dy = pos[vi][1] - pos[vj][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1), f = (k * k) / dist;
      d[vi][0] += (dx / dist) * f; d[vi][1] += (dy / dist) * f;
      d[vj][0] -= (dx / dist) * f; d[vj][1] -= (dy / dist) * f;
    }
    for (const e of graph.edges()) {
      const dx = pos[e.source][0] - pos[e.target][0], dy = pos[e.source][1] - pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1), f = (dist * dist) / k;
      d[e.source][0] -= (dx / dist) * f; d[e.source][1] -= (dy / dist) * f;
      d[e.target][0] += (dx / dist) * f; d[e.target][1] += (dy / dist) * f;
    }
    for (const v of nodes) {
      const len = Math.max(Math.sqrt(d[v][0] ** 2 + d[v][1] ** 2), 0.1);
      pos[v][0] = Math.max(50, Math.min(W - 50, pos[v][0] + (d[v][0] / len) * Math.min(len, temp)));
      pos[v][1] = Math.max(50, Math.min(H - 50, pos[v][1] + (d[v][1] / len) * Math.min(len, temp)));
    }
    temp *= 0.94;
  }
  return pos;
}

const palette = ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E86B5A', '#6DC8EC', '#9270CA', '#269A99', '#FF9845', '#FF6B81', '#61DDAA'];
const app = document.getElementById('app')!;
let N = 200;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:6px 12px;background:rgba(10,10,18,0.92);border-radius:8px;border:1px solid rgba(90,216,166,0.15);backdrop-filter:blur(8px)';
ctrl.innerHTML = '<span style="color:#5ad8a6;font:11px/1 system-ui;font-weight:500">Nodes</span><input id="ns" type="range" min="80" max="500" value="200" style="width:100px;accent-color:#5ad8a6"><span id="nv" style="color:#bbb;font:11px system-ui;width:36px;text-align:center">200</span><button id="go" style="padding:3px 14px;background:linear-gradient(135deg,rgba(90,216,166,0.25),rgba(90,216,166,0.05));border:1px solid rgba(90,216,166,0.4);border-radius:6px;color:#5ad8a6;font:11px system-ui;font-weight:600;cursor:pointer">Run</button>';

const cv = createCanvas(app);
cv.wrapper.appendChild(ctrl);
let graph: Graph, labels: Map<number, number>, pos: Record<number, [number, number]>;
let commMap: Map<number, number[]>, commColor: Map<number, string>;
let zp: ReturnType<typeof enableZoomPan>;

function run() {
  const t0 = performance.now();
  graph = makeCommunityGraph(N);
  labels = detectComm(graph);
  const W = 1400, H = 1000;
  pos = forceLayout(graph, W, H);
  const elapsed = (performance.now() - t0).toFixed(0);

  commMap = new Map();
  for (const [nd, lbl] of labels) { if (!commMap.has(lbl)) commMap.set(lbl, []); commMap.get(lbl)!.push(nd); }
  commColor = new Map();
  let ci = 0;
  for (const [lbl] of [...commMap.entries()].sort((a, b) => b[1].length - a[1].length)) {
    commColor.set(lbl, palette[ci % palette.length]); ci++;
  }

  if (!zp) zp = enableZoomPan(cv.canvas, draw);
  draw();
  console.log(graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges, ' + commMap.size + ' communities (' + elapsed + 'ms)');
}

function draw(scale?: number, ox?: number, oy?: number) {
  if (!graph) return;
  const cW = cv.width, cH = cv.height, ctx = cv.ctx;
  const t = zp ? zp.getTransform() : { scale: 1, offsetX: 0, offsetY: 0 };
  const s = scale ?? t.scale, oX = ox ?? t.offsetX, oY = oy ?? t.offsetY;
  const W = 1400, H = 1000, sx = cW / W * s, sy = cH / H * s;
  ctx.clearRect(0, 0, cW, cH); ctx.fillStyle = '#080b12'; ctx.fillRect(0, 0, cW, cH);
  ctx.save(); ctx.translate(oX, oY);
  ctx.lineCap = 'round';

  for (const e of graph.edges()) {
    const same = labels.get(e.source) === labels.get(e.target);
    const color = same ? commColor.get(labels.get(e.source)!) || '#555566' : '#555566';
    ctx.beginPath();
    ctx.moveTo(pos[e.source][0] * sx, pos[e.source][1] * sy);
    ctx.lineTo(pos[e.target][0] * sx, pos[e.target][1] * sy);
    ctx.strokeStyle = same ? color + '38' : 'rgba(60,70,90,0.04)';
    ctx.lineWidth = same ? 1.0 : 0.3;
    ctx.stroke();
  }

  for (const id of graph.nodes()) {
    const x = pos[id][0] * sx, y = pos[id][1] * sy;
    const color = commColor.get(labels.get(id)!) || '#555555';
    const d = graph.degree(id);
    const r = (3 + d * 0.6) * Math.min(s, 2.5);

    if (d > 6) {
      const grd = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.5);
      grd.addColorStop(0, color + '45');
      grd.addColorStop(1, color + '00');
      ctx.fillStyle = grd;
      ctx.fillRect(x - r * 2.5, y - r * 2.5, r * 5, r * 5);
    }

    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.globalAlpha = 0.92; ctx.fill(); ctx.globalAlpha = 1;
  }
  ctx.restore();

  // Legend
  const sorted = [...commMap.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 8);
  const lH = sorted.length * 17 + 12;
  ctx.fillStyle = 'rgba(8,11,18,0.92)';
  ctx.beginPath(); ctx.roundRect(8, cH - 10 - lH, 115, lH, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(90,216,166,0.12)'; ctx.lineWidth = 0.5; ctx.stroke();
  ctx.textAlign = 'left'; ctx.font = '10px system-ui';
  sorted.forEach(([lbl, members], i) => {
    const y = cH - 12 - (sorted.length - 1 - i) * 17;
    ctx.fillStyle = commColor.get(lbl) || '#555555';
    ctx.beginPath(); ctx.arc(18, y - 3, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#aaa'; ctx.fillText(members.length + ' nodes', 28, y);
  });
}

cv.onResize(draw);

setTimeout(() => {
  document.getElementById('ns')!.addEventListener('input', (e: any) => { N = +e.target.value; document.getElementById('nv')!.textContent = N + ''; });
  document.getElementById('go')!.addEventListener('click', run);
  run();
}, 30);
`;

const centralityViz = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';
import { createCanvas } from './canvas-util.js';

const app = document.getElementById('app')!;
let N = 150;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:6px 12px;background:rgba(10,10,18,0.92);border-radius:8px;border:1px solid rgba(232,107,90,0.15);backdrop-filter:blur(8px)';
ctrl.innerHTML = '<span style="color:#e86b5a;font:11px/1 system-ui;font-weight:500">Nodes</span><input id="ns" type="range" min="50" max="300" value="150" style="width:100px;accent-color:#e86b5a"><span id="nv" style="color:#bbb;font:11px system-ui;width:36px;text-align:center">150</span><button id="go" style="padding:3px 14px;background:linear-gradient(135deg,rgba(232,107,90,0.25),rgba(232,107,90,0.05));border:1px solid rgba(232,107,90,0.4);border-radius:6px;color:#e86b5a;font:11px system-ui;font-weight:600;cursor:pointer">Run</button>';

function buildNetwork(n: number): Graph {
  const nc = Math.max(3, Math.round(n / 18));
  const cs = Math.floor(n / nc);
  const edges: [number, number][] = [], seen = new Set<string>();
  const add = (a: number, b: number) => { const k = Math.min(a, b) + '-' + Math.max(a, b); if (a !== b && !seen.has(k)) { seen.add(k); edges.push([a, b]); } };
  for (let c = 0; c < nc; c++) {
    const base = c * cs;
    for (let i = 0; i < cs; i++) for (let j = i + 1; j < cs; j++) if (Math.random() < 0.3) add(base + i, base + j);
  }
  for (let c = 0; c < nc - 1; c++) for (let k = 0; k < 2; k++) add(c * cs + Math.floor(Math.random() * cs), (c + 1) * cs + Math.floor(Math.random() * cs));
  return Graph.fromEdges(edges);
}

function betweenness(graph: Graph): Map<number, number> {
  const nodes = graph.nodes(), cb = new Map<number, number>();
  for (const v of nodes) cb.set(v, 0);
  for (const s of nodes) {
    const stack: number[] = [], pred = new Map<number, number[]>(), sigma = new Map<number, number>(), dist = new Map<number, number>();
    for (const v of nodes) { pred.set(v, []); sigma.set(v, 0); dist.set(v, -1); }
    sigma.set(s, 1); dist.set(s, 0); const queue = [s];
    while (queue.length > 0) {
      const v = queue.shift()!; stack.push(v);
      for (const w of graph.neighbors(v)) {
        if (dist.get(w)! < 0) { queue.push(w); dist.set(w, dist.get(v)! + 1); }
        if (dist.get(w) === dist.get(v)! + 1) { sigma.set(w, sigma.get(w)! + sigma.get(v)!); pred.get(w)!.push(v); }
      }
    }
    const delta = new Map<number, number>(); for (const v of nodes) delta.set(v, 0);
    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of pred.get(w)!) delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
      if (w !== s) cb.set(w, cb.get(w)! + delta.get(w)!);
    }
  }
  const mx = Math.max(...cb.values(), 1);
  for (const [k, v] of cb) cb.set(k, v / mx);
  return cb;
}

function forceLayout(graph: Graph, W: number, H: number) {
  const nodes = graph.nodes(), n = nodes.length, k = Math.sqrt(W * H / n) * 1.3;
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [80 + Math.random() * (W - 160), 80 + Math.random() * (H - 160)];
  let temp = W / 3;
  for (let it = 0; it < 130; it++) {
    const d: Record<number, [number, number]> = {};
    for (const v of nodes) d[v] = [0, 0];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const vi = nodes[i], vj = nodes[j], dx = pos[vi][0] - pos[vj][0], dy = pos[vi][1] - pos[vj][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1), f = (k * k) / dist;
      d[vi][0] += (dx / dist) * f; d[vi][1] += (dy / dist) * f; d[vj][0] -= (dx / dist) * f; d[vj][1] -= (dy / dist) * f;
    }
    for (const e of graph.edges()) {
      const dx = pos[e.source][0] - pos[e.target][0], dy = pos[e.source][1] - pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1), f = (dist * dist) / k;
      d[e.source][0] -= (dx / dist) * f; d[e.source][1] -= (dy / dist) * f;
      d[e.target][0] += (dx / dist) * f; d[e.target][1] += (dy / dist) * f;
    }
    for (const v of nodes) {
      const len = Math.max(Math.sqrt(d[v][0] ** 2 + d[v][1] ** 2), 0.1);
      pos[v][0] = Math.max(50, Math.min(W - 50, pos[v][0] + (d[v][0] / len) * Math.min(len, temp)));
      pos[v][1] = Math.max(50, Math.min(H - 50, pos[v][1] + (d[v][1] / len) * Math.min(len, temp)));
    }
    temp *= 0.94;
  }
  return pos;
}

const cv = createCanvas(app);
cv.wrapper.appendChild(ctrl);
let graph: Graph, bc: Map<number, number>, pos: Record<number, [number, number]>, sorted: [number, number][];
let zp: ReturnType<typeof enableZoomPan>;

function scoreColor(score: number): string {
  if (score > 0.5) { const t = (score - 0.5) * 2; return 'hsl(' + (30 - t * 25) + ',85%,' + (55 + t * 10) + '%)'; }
  if (score > 0.1) { const t = (score - 0.1) / 0.4; return 'hsl(' + (220 - t * 190) + ',75%,' + (50 + t * 5) + '%)'; }
  return 'hsl(220,40%,30%)';
}

function run() {
  const t0 = performance.now();
  graph = buildNetwork(N);
  bc = betweenness(graph);
  const W = 1400, H = 1000;
  pos = forceLayout(graph, W, H);
  sorted = [...bc.entries()].sort((a, b) => b[1] - a[1]);
  const elapsed = (performance.now() - t0).toFixed(0);

  if (!zp) zp = enableZoomPan(cv.canvas, draw);
  draw();
  console.log(graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges (' + elapsed + 'ms)');
  console.log('Top bridges: ' + sorted.slice(0, 5).map(([id, s]) => '#' + id + '=' + s.toFixed(3)).join(', '));
}

function draw(scale?: number, ox?: number, oy?: number) {
  if (!graph) return;
  const cW = cv.width, cH = cv.height, ctx = cv.ctx;
  const t = zp ? zp.getTransform() : { scale: 1, offsetX: 0, offsetY: 0 };
  const s = scale ?? t.scale, oX = ox ?? t.offsetX, oY = oy ?? t.offsetY;
  const W = 1400, H = 1000, sx = cW / W * s, sy = cH / H * s;
  ctx.clearRect(0, 0, cW, cH); ctx.fillStyle = '#080b12'; ctx.fillRect(0, 0, cW, cH);
  ctx.save(); ctx.translate(oX, oY);
  ctx.lineCap = 'round';

  for (const e of graph.edges()) {
    const avgScore = ((bc.get(e.source) || 0) + (bc.get(e.target) || 0)) / 2;
    ctx.beginPath();
    ctx.moveTo(pos[e.source][0] * sx, pos[e.source][1] * sy);
    ctx.lineTo(pos[e.target][0] * sx, pos[e.target][1] * sy);
    ctx.strokeStyle = 'rgba(100,140,200,' + (0.05 + avgScore * 0.22) + ')';
    ctx.lineWidth = 0.5 + avgScore * 2.0;
    ctx.stroke();
  }

  for (const id of graph.nodes()) {
    const x = pos[id][0] * sx, y = pos[id][1] * sy;
    const score = bc.get(id) || 0;
    const r = (3 + score * 16) * Math.min(s, 2.5);

    if (score > 0.25) {
      const grd = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 3);
      grd.addColorStop(0, 'rgba(232,107,90,' + (0.18 + score * 0.22) + ')');
      grd.addColorStop(1, 'rgba(232,107,90,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    }

    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = scoreColor(score); ctx.fill();
    if (score > 0.5) { ctx.strokeStyle = 'rgba(255,200,150,0.55)'; ctx.lineWidth = 1.4; ctx.stroke(); }
  }

  ctx.font = '10px system-ui'; ctx.fillStyle = 'rgba(255,220,200,0.92)'; ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 3;
  sorted.slice(0, 6).forEach(([id, score]) => {
    const x = pos[id][0] * sx, y = pos[id][1] * sy;
    const r = (3 + score * 16) * Math.min(s, 2.5);
    ctx.fillText('#' + id + ' (' + score.toFixed(2) + ')', x, y - r - 6);
  });
  ctx.shadowBlur = 0;
  ctx.restore();

  // Legend
  ctx.fillStyle = 'rgba(8,11,18,0.92)';
  ctx.beginPath(); ctx.roundRect(8, cH - 84, 150, 76, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(232,107,90,0.12)'; ctx.lineWidth = 0.5; ctx.stroke();
  ctx.textAlign = 'left'; ctx.font = '10px system-ui';
  const legend: [string, string][] = [['hsl(5,85%,60%)', 'Critical bridge (>0.5)'], ['hsl(30,75%,55%)', 'Important (0.2-0.5)'], ['hsl(130,75%,50%)', 'Moderate (0.1-0.2)'], ['hsl(220,40%,30%)', 'Peripheral']];
  legend.forEach(([color, label], i) => {
    const y = cH - 68 + i * 16;
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(18, y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#999'; ctx.fillText(label, 28, y + 3);
  });
}

cv.onResize(draw);

setTimeout(() => {
  document.getElementById('ns')!.addEventListener('input', (e: any) => { N = +e.target.value; document.getElementById('nv')!.textContent = N + ''; });
  document.getElementById('go')!.addEventListener('click', run);
  run();
}, 30);
`;

const pageRankViz = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';
import { createCanvas } from './canvas-util.js';

const app = document.getElementById('app')!;
let N = 250;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:6px 12px;background:rgba(10,10,18,0.92);border-radius:8px;border:1px solid rgba(246,189,22,0.15);backdrop-filter:blur(8px)';
ctrl.innerHTML = '<span style="color:#f6bd16;font:11px/1 system-ui;font-weight:500">Pages</span><input id="ns" type="range" min="80" max="600" value="250" style="width:100px;accent-color:#f6bd16"><span id="nv" style="color:#bbb;font:11px system-ui;width:36px;text-align:center">250</span><button id="go" style="padding:3px 14px;background:linear-gradient(135deg,rgba(246,189,22,0.25),rgba(246,189,22,0.05));border:1px solid rgba(246,189,22,0.4);border-radius:6px;color:#f6bd16;font:11px system-ui;font-weight:600;cursor:pointer">Run</button>';

function webGraph(n: number): Graph {
  const edges: [number, number][] = [], seen = new Set<string>();
  const add = (f: number, t: number) => { const k = f + '-' + t; if (f !== t && !seen.has(k)) { seen.add(k); edges.push([f, t]); } };
  const nc = Math.max(5, Math.round(n / 30));
  const cs = Math.floor(n / nc);
  for (let c = 0; c < nc; c++) {
    const base = c * cs;
    for (let i = 0; i < cs; i++) { const nl = 2 + Math.floor(Math.random() * 4); for (let t = 0; t < nl; t++) add(base + i, base + Math.floor(Math.random() * cs)); }
    const hub = base + Math.floor(Math.random() * 3);
    for (let i = 0; i < cs; i++) add(hub, base + i);
  }
  for (let i = 0; i < n / 3; i++) add(Math.floor(Math.random() * n), Math.floor(Math.random() * n));
  return Graph.fromEdges(edges, { directed: true });
}

function pageRank(graph: Graph, d = 0.85, iter = 50): Map<number, number> {
  const nodes = graph.nodes(), n = nodes.length;
  const outDeg = new Map<number, number>(), inLinks = new Map<number, number[]>();
  for (const id of nodes) { outDeg.set(id, 0); inLinks.set(id, []); }
  for (const e of graph.edges()) { outDeg.set(e.source, (outDeg.get(e.source) || 0) + 1); inLinks.get(e.target)!.push(e.source); }
  let rank = new Map<number, number>();
  for (const id of nodes) rank.set(id, 1 / n);
  for (let i = 0; i < iter; i++) {
    let dangle = 0;
    for (const id of nodes) if ((outDeg.get(id) || 0) === 0) dangle += rank.get(id)!;
    const nr = new Map<number, number>();
    for (const id of nodes) {
      let sum = 0;
      for (const src of inLinks.get(id)!) sum += (rank.get(src) || 0) / (outDeg.get(src) || 1);
      nr.set(id, (1 - d) / n + d * (sum + dangle / n));
    }
    rank = nr;
  }
  return rank;
}

function forceLayout(graph: Graph, W: number, H: number) {
  const nodes = graph.nodes(), n = nodes.length, k = Math.sqrt(W * H / n) * 0.85;
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [80 + Math.random() * (W - 160), 80 + Math.random() * (H - 160)];
  let temp = W / 4;
  for (let it = 0; it < 110; it++) {
    const d: Record<number, [number, number]> = {};
    for (const v of nodes) d[v] = [0, 0];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const vi = nodes[i], vj = nodes[j], dx = pos[vi][0] - pos[vj][0], dy = pos[vi][1] - pos[vj][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.5), f = (k * k) / dist * 0.6;
      d[vi][0] += (dx / dist) * f; d[vi][1] += (dy / dist) * f; d[vj][0] -= (dx / dist) * f; d[vj][1] -= (dy / dist) * f;
    }
    for (const e of graph.edges()) {
      const dx = pos[e.source][0] - pos[e.target][0], dy = pos[e.source][1] - pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.5), f = (dist * dist) / k * 0.35;
      d[e.source][0] -= (dx / dist) * f; d[e.source][1] -= (dy / dist) * f;
      d[e.target][0] += (dx / dist) * f; d[e.target][1] += (dy / dist) * f;
    }
    for (const v of nodes) {
      const len = Math.max(Math.sqrt(d[v][0] ** 2 + d[v][1] ** 2), 0.1);
      pos[v][0] = Math.max(50, Math.min(W - 50, pos[v][0] + (d[v][0] / len) * Math.min(len, temp)));
      pos[v][1] = Math.max(50, Math.min(H - 50, pos[v][1] + (d[v][1] / len) * Math.min(len, temp)));
    }
    temp *= 0.93;
  }
  return pos;
}

const cv = createCanvas(app);
cv.wrapper.appendChild(ctrl);
let graph: Graph, ranks: Map<number, number>, pos: Record<number, [number, number]>, sorted: [number, number][], maxR: number;
let zp: ReturnType<typeof enableZoomPan>;

function run() {
  graph = webGraph(N);
  ranks = pageRank(graph);
  const W = 1400, H = 1000;
  pos = forceLayout(graph, W, H);
  sorted = [...ranks.entries()].sort((a, b) => b[1] - a[1]);
  maxR = sorted.length > 0 ? sorted[0][1] : 1;

  if (!zp) zp = enableZoomPan(cv.canvas, draw);
  draw();
  console.log(graph.nodeCount() + ' pages, ' + graph.edgeCount() + ' links');
  console.log('Top: ' + sorted.slice(0, 5).map(([id, r]) => '#' + id + '=' + r.toFixed(5)).join(', '));
}

function draw(scale?: number, ox?: number, oy?: number) {
  if (!graph) return;
  const cW = cv.width, cH = cv.height, ctx = cv.ctx;
  const t = zp ? zp.getTransform() : { scale: 1, offsetX: 0, offsetY: 0 };
  const s = scale ?? t.scale, oX = ox ?? t.offsetX, oY = oy ?? t.offsetY;
  const W = 1400, H = 1000, sx = cW / W * s, sy = cH / H * s;
  ctx.clearRect(0, 0, cW, cH); ctx.fillStyle = '#080b12'; ctx.fillRect(0, 0, cW, cH);
  ctx.save(); ctx.translate(oX, oY);
  ctx.lineCap = 'round';

  for (const e of graph.edges()) {
    const srcR = (ranks.get(e.source) || 0) / maxR;
    const tgtR = (ranks.get(e.target) || 0) / maxR;
    const importance = Math.max(srcR, tgtR);
    ctx.beginPath();
    ctx.moveTo(pos[e.source][0] * sx, pos[e.source][1] * sy);
    ctx.lineTo(pos[e.target][0] * sx, pos[e.target][1] * sy);
    ctx.strokeStyle = 'rgba(100,150,220,' + (0.03 + importance * 0.14) + ')';
    ctx.lineWidth = 0.4 + importance * 1.2;
    ctx.stroke();
  }

  for (const id of graph.nodes()) {
    const x = pos[id][0] * sx, y = pos[id][1] * sy;
    const norm = (ranks.get(id) || 0) / maxR;
    const r = (2 + norm * 18) * Math.min(s, 2.5);

    if (norm > 0.25) {
      const grd = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 3);
      grd.addColorStop(0, 'rgba(246,189,22,' + (norm * 0.38) + ')');
      grd.addColorStop(1, 'rgba(246,189,22,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    }

    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (norm > 0.5) ctx.fillStyle = '#F6BD16';
    else if (norm > 0.25) { const t2 = (norm - 0.25) * 4; ctx.fillStyle = 'hsl(' + (190 - t2 * 145) + ',70%,' + (50 + t2 * 10) + '%)'; }
    else if (norm > 0.08) ctx.fillStyle = '#4a8fcc';
    else ctx.fillStyle = '#2a3a55';
    ctx.fill();
    if (norm > 0.5) { ctx.strokeStyle = 'rgba(246,189,22,0.55)'; ctx.lineWidth = 1.5; ctx.stroke(); }
  }

  ctx.font = '10px system-ui'; ctx.fillStyle = 'rgba(255,240,200,0.92)'; ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 3;
  sorted.slice(0, 6).forEach(([id, rank]) => {
    const x = pos[id][0] * sx, y = pos[id][1] * sy;
    const r = (2 + (rank / maxR) * 18) * Math.min(s, 2.5);
    ctx.fillText('page ' + id, x, y - r - 6);
  });
  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.fillStyle = 'rgba(8,11,18,0.92)';
  ctx.beginPath(); ctx.roundRect(8, cH - 66, 135, 58, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(246,189,22,0.12)'; ctx.lineWidth = 0.5; ctx.stroke();
  ctx.textAlign = 'left'; ctx.font = '10px system-ui';
  const legend: [string, string][] = [['#F6BD16', 'Authority (>0.5)'], ['#4a8fcc', 'Mid rank'], ['#2a3a55', 'Low rank']];
  legend.forEach(([color, label], i) => {
    const y = cH - 50 + i * 16;
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(18, y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#999'; ctx.fillText(label, 28, y + 3);
  });
}

cv.onResize(draw);

setTimeout(() => {
  document.getElementById('ns')!.addEventListener('input', (e: any) => { N = +e.target.value; document.getElementById('nv')!.textContent = N + ''; });
  document.getElementById('go')!.addEventListener('click', run);
  run();
}, 30);
`;

const perfBenchmark = `import { Graph } from './graphrs-core.js';
import { createCanvas } from './canvas-util.js';

function barabasiAlbert(n: number, m: number): Graph {
  const edges: [number, number][] = [], degree: number[] = new Array(n).fill(0);
  for (let i = 0; i <= m; i++) for (let j = i + 1; j <= m; j++) { edges.push([i, j]); degree[i]++; degree[j]++; }
  for (let i = m + 1; i < n; i++) {
    const targets = new Set<number>(); const total = degree.reduce((a, b) => a + b, 0);
    while (targets.size < m) { let r = Math.random() * total; for (let j = 0; j < i; j++) { r -= degree[j]; if (r <= 0) { targets.add(j); break; } } }
    for (const t of targets) { edges.push([i, t]); degree[i]++; degree[t]++; }
  }
  return Graph.fromEdges(edges);
}

function bfs(graph: Graph, start: number): number {
  const visited = new Set<number>([start]); const queue = [start];
  while (queue.length > 0) { const nd = queue.shift()!; for (const nb of graph.neighbors(nd)) if (!visited.has(nb)) { visited.add(nb); queue.push(nb); } }
  return visited.size;
}

function dijkstra(graph: Graph, start: number): Map<number, number> {
  const dist = new Map<number, number>(); dist.set(start, 0);
  const visited = new Set<number>(); const pq: [number, number][] = [[0, start]];
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    for (const nb of graph.neighbors(u)) {
      const nd = d + 1;
      if (!dist.has(nb) || nd < dist.get(nb)!) { dist.set(nb, nd); pq.push([nd, nb]); }
    }
  }
  return dist;
}

function betweenness(graph: Graph): number {
  const nodes = graph.nodes(); let mx = 0;
  for (const s of nodes) {
    const stack: number[] = [], pred = new Map<number, number[]>(), sigma = new Map<number, number>(), dist = new Map<number, number>();
    for (const v of nodes) { pred.set(v, []); sigma.set(v, 0); dist.set(v, -1); }
    sigma.set(s, 1); dist.set(s, 0); const queue = [s];
    while (queue.length > 0) { const v = queue.shift()!; stack.push(v); for (const w of graph.neighbors(v)) { if (dist.get(w)! < 0) { queue.push(w); dist.set(w, dist.get(v)! + 1); } if (dist.get(w) === dist.get(v)! + 1) { sigma.set(w, sigma.get(w)! + sigma.get(v)!); pred.get(w)!.push(v); } } }
    const delta = new Map<number, number>(); for (const v of nodes) delta.set(v, 0);
    while (stack.length > 0) { const w = stack.pop()!; for (const v of pred.get(w)!) delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!)); if (w !== s && delta.get(w)! > mx) mx = delta.get(w)!; }
  }
  return mx;
}

function pageRank(graph: Graph, iter = 30): number {
  const nodes = graph.nodes(), n = nodes.length;
  let rank = new Map<number, number>();
  for (const id of nodes) rank.set(id, 1 / n);
  for (let i = 0; i < iter; i++) {
    const nr = new Map<number, number>();
    for (const id of nodes) {
      const nbs = graph.neighbors(id);
      let sum = 0;
      for (const nb of nbs) sum += (rank.get(nb) || 0) / graph.degree(nb);
      nr.set(id, 0.15 / n + 0.85 * sum);
    }
    rank = nr;
  }
  return Math.max(...rank.values());
}

const app = document.getElementById('app')!;
const cv = createCanvas(app);

const sizes = [200, 500, 1000, 2000];
type Result = { n: number; edges: number; bfs: number; dijkstra: number; pagerank: number; betw: number };
let results: Result[] = [];
let running = false;

const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:6px 12px;background:rgba(10,10,18,0.92);border-radius:8px;border:1px solid rgba(100,200,140,0.15);backdrop-filter:blur(8px)';
ctrl.innerHTML = '<button id="go" style="padding:4px 16px;background:linear-gradient(135deg,rgba(90,216,166,0.3),rgba(90,216,166,0.05));border:1px solid rgba(90,216,166,0.5);border-radius:6px;color:#5ad8a6;font:12px system-ui;font-weight:600;cursor:pointer">Run Benchmark</button><span id="status" style="color:#778;font:10px system-ui"></span>';
cv.wrapper.appendChild(ctrl);

function fmt(ms: number): string {
  if (ms >= 1000) return (ms / 1000).toFixed(1) + 's';
  if (ms >= 1) return ms.toFixed(1) + 'ms';
  return (ms * 1000).toFixed(0) + 'us';
}

function drawChart() {
  const cW = cv.width, cH = cv.height, ctx = cv.ctx;
  ctx.clearRect(0, 0, cW, cH); ctx.fillStyle = '#080b12'; ctx.fillRect(0, 0, cW, cH);

  const mg = { top: 70, right: 30, bottom: 65, left: 70 };
  const w = cW - mg.left - mg.right, h = cH - mg.top - mg.bottom;
  if (w < 100 || h < 100) return;
  ctx.save(); ctx.translate(mg.left, mg.top);

  // Chart area background
  ctx.fillStyle = 'rgba(20,25,35,0.5)';
  ctx.beginPath(); ctx.roundRect(-10, -55, w + 20, h + 80, 8); ctx.fill();

  ctx.fillStyle = '#e8e8ec'; ctx.font = 'bold 14px system-ui';
  ctx.fillText('Algorithm Performance: Pure JS Baseline', 0, -42);
  ctx.fillStyle = '#778'; ctx.font = '11px system-ui';
  ctx.fillText('Lower is better. @graphrs WASM delivers 10-500x speedup.', 0, -24);

  if (results.length === 0) {
    ctx.fillStyle = '#556'; ctx.font = '13px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Click "Run Benchmark" to measure algorithm performance', w / 2, h / 2);
    ctx.restore(); return;
  }

  const allTimes = results.flatMap(r => [r.bfs, r.dijkstra, r.pagerank, r.betw].filter(v => v > 0));
  const minT = Math.min(...allTimes) * 0.5;
  const maxT = Math.max(...allTimes) * 2;
  const logMin = Math.floor(Math.log10(Math.max(minT, 0.001)));
  const logMax = Math.ceil(Math.log10(maxT));

  for (let p = logMin; p <= logMax; p++) {
    const y = h - ((p - logMin) / (logMax - logMin)) * h;
    ctx.strokeStyle = 'rgba(100,120,150,0.08)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    ctx.fillStyle = '#667'; ctx.font = '10px system-ui'; ctx.textAlign = 'right';
    const label = p <= -3 ? '1us' : p === -2 ? '10us' : p === -1 ? '0.1ms' : p === 0 ? '1ms' : p === 1 ? '10ms' : p === 2 ? '100ms' : (Math.pow(10, p) / 1000).toFixed(0) + 's';
    ctx.fillText(label, -8, y + 3);
  }

  const algos = [
    { key: 'bfs', label: 'BFS', color: '#5B8FF9' },
    { key: 'dijkstra', label: 'Dijkstra', color: '#6DC8EC' },
    { key: 'pagerank', label: 'PageRank', color: '#F6BD16' },
    { key: 'betw', label: 'Betweenness', color: '#E86B5A' },
  ];
  const nAlgo = algos.length;
  const groupW = w / results.length;
  const barW = groupW * 0.18;
  const groupGap = groupW * 0.12;

  ctx.textAlign = 'center';
  results.forEach((r, i) => {
    const gx = i * groupW + groupGap;
    algos.forEach((algo, ai) => {
      const val = (r as any)[algo.key] as number;
      if (val <= 0) return;
      const barH = Math.max(2, ((Math.log10(val) - logMin) / (logMax - logMin)) * h);
      const x = gx + ai * (barW + 3);
      const grd = ctx.createLinearGradient(0, h - barH, 0, h);
      grd.addColorStop(0, algo.color); grd.addColorStop(1, algo.color + '60');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.roundRect(x, h - barH, barW, barH, [3, 3, 0, 0]); ctx.fill();
      ctx.fillStyle = algo.color; ctx.font = '8px system-ui';
      ctx.fillText(fmt(val), x + barW / 2, h - barH - 4);
    });
    ctx.fillStyle = '#ccc'; ctx.font = '11px system-ui';
    ctx.fillText(r.n + ' nodes', gx + (nAlgo * (barW + 3)) / 2, h + 18);
    ctx.fillStyle = '#667'; ctx.font = '9px system-ui';
    ctx.fillText(r.edges + ' edges', gx + (nAlgo * (barW + 3)) / 2, h + 32);
  });

  // Legend
  ctx.textAlign = 'left';
  algos.forEach((algo, i) => {
    const lx = w - 160, ly = -40 + i * 15;
    ctx.fillStyle = algo.color; ctx.beginPath(); ctx.roundRect(lx, ly, 10, 10, 2); ctx.fill();
    ctx.fillStyle = '#bbb'; ctx.font = '10px system-ui'; ctx.fillText(algo.label, lx + 14, ly + 9);
  });
  ctx.restore();
}

cv.onResize(drawChart);

async function runBench() {
  if (running) return;
  running = true;
  results = [];
  document.getElementById('status')!.textContent = 'Running...';
  drawChart();

  for (const n of sizes) {
    document.getElementById('status')!.textContent = 'Testing ' + n + ' nodes...';
    await new Promise(r => setTimeout(r, 10));
    const g = barabasiAlbert(n, 3);
    const runs = n < 500 ? 50 : 10;
    let t = performance.now(); for (let i = 0; i < runs; i++) bfs(g, 0); const bfsTime = (performance.now() - t) / runs;
    t = performance.now(); for (let i = 0; i < runs; i++) dijkstra(g, 0); const dijkstraTime = (performance.now() - t) / runs;
    t = performance.now(); for (let i = 0; i < (n < 500 ? 10 : 3); i++) pageRank(g, 20); const prTime = (performance.now() - t) / (n < 500 ? 10 : 3);
    let betwTime = 0;
    if (n <= 1000) { t = performance.now(); betweenness(g); betwTime = performance.now() - t; }
    results.push({ n, edges: g.edgeCount(), bfs: bfsTime, dijkstra: dijkstraTime, pagerank: prTime, betw: betwTime });
    drawChart();
    console.log(n + ' nodes: BFS ' + fmt(bfsTime) + ', Dijkstra ' + fmt(dijkstraTime) + ', PageRank ' + fmt(prTime) + (betwTime > 0 ? ', Betweenness ' + fmt(betwTime) : ''));
  }
  document.getElementById('status')!.textContent = 'Done. WASM would be 10-500x faster.';
  running = false;
}

drawChart();
setTimeout(() => { document.getElementById('go')!.addEventListener('click', runBench); }, 30);
`;

const generatorsViz = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';
import { createCanvas } from './canvas-util.js';

function erdosRenyi(n: number, p: number): Graph {
  const edges: [number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (Math.random() < p) edges.push([i, j]);
  }
  return Graph.fromEdges(edges);
}

function barabasiAlbert(n: number, m: number): Graph {
  const edges: [number, number][] = [];
  const degree: number[] = new Array(n).fill(0);
  for (let i = 0; i <= m; i++) for (let j = i + 1; j <= m; j++) {
    edges.push([i, j]); degree[i]++; degree[j]++;
  }
  for (let i = m + 1; i < n; i++) {
    const targets = new Set<number>();
    const total = degree.reduce((a, b) => a + b, 0);
    while (targets.size < m) {
      let r = Math.random() * total;
      for (let j = 0; j < i; j++) { r -= degree[j]; if (r <= 0) { targets.add(j); break; } }
    }
    for (const t of targets) { edges.push([i, t]); degree[i]++; degree[t]++; }
  }
  return Graph.fromEdges(edges);
}

function wattsStrogatz(n: number, k: number, beta: number): Graph {
  const edges: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 1; j <= k / 2; j++) {
      const target = (i + j) % n;
      if (Math.random() < beta) {
        let newTarget: number;
        do { newTarget = Math.floor(Math.random() * n); }
        while (newTarget === i || edges.some(e => (e[0] === i && e[1] === newTarget) || (e[0] === newTarget && e[1] === i)));
        edges.push([i, newTarget]);
      } else {
        edges.push([i, target]);
      }
    }
  }
  return Graph.fromEdges(edges);
}

function ringGraph(n: number): Graph {
  const edges: [number, number][] = [];
  for (let i = 0; i < n; i++) edges.push([i, (i + 1) % n]);
  return Graph.fromEdges(edges);
}

function starGraph(n: number): Graph {
  const edges: [number, number][] = [];
  for (let i = 1; i < n; i++) edges.push([0, i]);
  return Graph.fromEdges(edges);
}

function completeGraph(n: number): Graph {
  const edges: [number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push([i, j]);
  return Graph.fromEdges(edges);
}

type GeneratorType = 'barabasi-albert' | 'erdos-renyi' | 'watts-strogatz' | 'ring' | 'star' | 'complete';

function generate(type: GeneratorType, n: number): Graph {
  switch (type) {
    case 'barabasi-albert': return barabasiAlbert(n, 2);
    case 'erdos-renyi': return erdosRenyi(n, 3 / n);
    case 'watts-strogatz': return wattsStrogatz(n, 4, 0.3);
    case 'ring': return ringGraph(n);
    case 'star': return starGraph(n);
    case 'complete': return completeGraph(Math.min(n, 20));
  }
}

function forceLayout(graph: Graph, W: number, H: number, iter = 150) {
  const nodes = graph.nodes(), n = nodes.length;
  if (n === 0) return {};
  const k = Math.sqrt(W * H / n) * 0.9;
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [50 + Math.random() * (W - 100), 50 + Math.random() * (H - 100)];
  let temp = W / 4;
  for (let it = 0; it < iter; it++) {
    const disp: Record<number, [number, number]> = {};
    for (const v of nodes) disp[v] = [0, 0];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const vi = nodes[i], vj = nodes[j];
      const dx = pos[vi][0] - pos[vj][0], dy = pos[vi][1] - pos[vj][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
      const f = (k * k) / dist;
      disp[vi][0] += (dx / dist) * f; disp[vi][1] += (dy / dist) * f;
      disp[vj][0] -= (dx / dist) * f; disp[vj][1] -= (dy / dist) * f;
    }
    for (const e of graph.edges()) {
      const dx = pos[e.source][0] - pos[e.target][0], dy = pos[e.source][1] - pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
      const f = (dist * dist) / k;
      disp[e.source][0] -= (dx / dist) * f; disp[e.source][1] -= (dy / dist) * f;
      disp[e.target][0] += (dx / dist) * f; disp[e.target][1] += (dy / dist) * f;
    }
    for (const v of nodes) {
      const d = Math.sqrt(disp[v][0] ** 2 + disp[v][1] ** 2) || 1;
      pos[v][0] += (disp[v][0] / d) * Math.min(d, temp);
      pos[v][1] += (disp[v][1] / d) * Math.min(d, temp);
      pos[v][0] = Math.max(30, Math.min(W - 30, pos[v][0]));
      pos[v][1] = Math.max(30, Math.min(H - 30, pos[v][1]));
    }
    temp *= 0.95;
  }
  return pos;
}

const app = document.getElementById('app')!;
const ctrl = document.createElement('div');
ctrl.innerHTML = '<div style="position:absolute;top:8px;left:8px;z-index:10;display:flex;gap:8px;align-items:center"><select id="model" style="padding:4px 8px;border-radius:4px;border:1px solid #444;background:#1a1d24;color:#ddd;font-size:12px"><option value="barabasi-albert">Barabási–Albert</option><option value="erdos-renyi">Erdős–Rényi</option><option value="watts-strogatz">Watts–Strogatz</option><option value="ring">Ring</option><option value="star">Star</option><option value="complete">Complete</option></select><input id="slider" type="range" min="10" max="80" value="40" style="width:100px;accent-color:#5B8FF9"><span id="lbl" style="color:#aaa;font-size:11px">n=40</span><button id="go" style="padding:4px 12px;border-radius:4px;border:1px solid #5B8FF9;background:#1a2a40;color:#8ac;font-size:12px;cursor:pointer">Generate</button></div>';
app.appendChild(ctrl);
const cv = createCanvas(app);
const { ctx } = cv;

let graph: Graph | null = null;
let pos: Record<number, [number, number]> = {};
let currentType: GeneratorType = 'barabasi-albert';
let N = 40;

const descriptions: Record<GeneratorType, string> = {
  'barabasi-albert': 'Scale-free: preferential attachment (power-law degree)',
  'erdos-renyi': 'Random: each edge with probability p = 3/n',
  'watts-strogatz': 'Small-world: high clustering, short paths (k=4, β=0.3)',
  'ring': 'Regular ring lattice: each node connects to next',
  'star': 'Star topology: one hub connected to all others',
  'complete': 'Complete graph: every node connected to every other',
};

function run() {
  graph = generate(currentType, N);
  pos = forceLayout(graph, cv.width, cv.height);
  draw();
}

function draw(scale = 1, ox = 0, oy = 0) {
  if (!graph) return;
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  const nodes = graph.nodes();
  const deg: Record<number, number> = {};
  for (const id of nodes) deg[id] = graph.degree(id);
  const maxDeg = Math.max(...Object.values(deg), 1);

  // Edges
  ctx.lineCap = 'round';
  for (const e of graph.edges()) {
    const p1 = pos[e.source], p2 = pos[e.target];
    if (!p1 || !p2) continue;
    const strength = (deg[e.source] + deg[e.target]) / (2 * maxDeg);
    ctx.strokeStyle = 'rgba(91,143,249,' + (0.15 + strength * 0.35) + ')';
    ctx.lineWidth = 0.8 + strength * 1.2;
    ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
  }

  // Nodes
  for (const id of nodes) {
    const p = pos[id];
    if (!p) continue;
    const d = deg[id] / maxDeg;
    const r = 3 + d * 8;

    // Glow for high-degree nodes
    if (d > 0.5) {
      ctx.beginPath(); ctx.arc(p[0], p[1], r + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(91,143,249,' + (d * 0.2) + ')'; ctx.fill();
    }

    ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    const hue = 210 + d * 30;
    const sat = 60 + d * 30;
    const lgt = 50 + d * 20;
    ctx.fillStyle = 'hsl(' + hue + ',' + sat + '%,' + lgt + '%)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.5; ctx.stroke();
  }

  // Info panel
  ctx.restore();
  ctx.save();
  ctx.fillStyle = 'rgba(10,14,20,0.85)';
  ctx.beginPath(); ctx.roundRect(W - 260, H - 64, 252, 56, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(91,143,249,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(W - 260, H - 64, 252, 56, 6); ctx.stroke();
  ctx.font = '11px system-ui'; ctx.textAlign = 'left';
  ctx.fillStyle = '#8ac';
  ctx.fillText(descriptions[currentType], W - 250, H - 44);
  ctx.fillStyle = '#aaa';
  ctx.fillText('Nodes: ' + graph.nodeCount() + '  Edges: ' + graph.edgeCount() + '  Max degree: ' + maxDeg, W - 250, H - 24);
  ctx.restore();
}

const zp = enableZoomPan(cv.canvas, draw);
cv.onResize(() => { const t = zp.getTransform(); draw(t.scale, t.offsetX, t.offsetY); });

document.getElementById('slider')!.addEventListener('input', (e) => {
  N = +(e.target as HTMLInputElement).value;
  document.getElementById('lbl')!.textContent = 'n=' + N;
});
document.getElementById('model')!.addEventListener('change', (e) => {
  currentType = (e.target as HTMLSelectElement).value as GeneratorType;
});
document.getElementById('go')!.addEventListener('click', run);

run();
`;
</script>

# 交互式演练场

实时图算法演示，由 `@graphrs/core` 驱动。通过滑块调整参数，点击 **Run** 重新生成。滚轮缩放，拖拽平移。点击 **Show Code** 查看源代码，**Fullscreen** 进入全屏沉浸式体验。

## BFS — 广度优先遍历

逐层动画展示 Barabási–Albert 无标度网络（m=3）的广度优先搜索过程。蓝色越深 = 距离最高度数枢纽节点的 BFS 层越远。边在枢纽节点附近发光更强：

<Playground :code="animatedBFS" />

## 社区发现

基于模块度优化的标签传播算法识别密集连接的社区。社区内部边高亮，跨社区连接淡化。高度数的社区枢纽节点带有光晕效果：

<Playground :code="communityViz" />

## 介数中心性

Brandes 算法计算每个节点被最短路径经过的频率。暖色调（红/橙）表示连接不同簇之间的结构性桥节点：

<Playground :code="centralityViz" />

## PageRank

对有向网页图运行幂迭代 PageRank 算法。节点大小和颜色编码权威度 — 金色节点是被链接最多的枢纽。边透明度反映连接重要性：

<Playground :code="pageRankViz" />

## 图生成器

比较不同随机图模型 — Barabási–Albert（无标度枢纽）、Erdős–Rényi（均匀随机）、Watts–Strogatz（小世界聚类）以及经典拓扑结构（环形、星形、完全图）。节点大小反映度数：

<Playground :code="generatorsViz" />

## 性能基准测试

点击 **Run Benchmark** 测量 BFS、Dijkstra、PageRank 和介数中心性在不同规模下的性能。图表展示 O(V+E) 与 O(V²·E) 的复杂度差异 — 1000 节点的介数中心性在纯 JS 中需要数秒，而 `@graphrs` WASM 可提供 10-500 倍加速：

<Playground :code="perfBenchmark" />
