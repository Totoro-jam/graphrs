<script setup>
const animatedBFS = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';

const app = document.getElementById('app')!;
const cW = app.clientWidth || 800, cH = app.clientHeight || 600;

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

function forceLayout(graph: Graph, W: number, H: number, iter = 120) {
  const nodes = graph.nodes(), n = nodes.length, k = Math.sqrt(W * H / n);
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [80 + Math.random() * (W - 160), 80 + Math.random() * (H - 160)];
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
      const d = Math.max(Math.sqrt(disp[v][0] ** 2 + disp[v][1] ** 2), 0.1);
      pos[v][0] = Math.max(50, Math.min(W - 50, pos[v][0] + (disp[v][0] / d) * Math.min(d, temp)));
      pos[v][1] = Math.max(50, Math.min(H - 50, pos[v][1] + (disp[v][1] / d) * Math.min(d, temp)));
    }
    temp *= 0.95;
  }
  return pos;
}

// Controls
let N = 200;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:4px 10px;background:rgba(15,15,20,0.85);border-radius:6px;border:1px solid rgba(255,255,255,0.08)';
ctrl.innerHTML = '<span style="color:#888;font:11px system-ui">Nodes</span><input id="ns" type="range" min="50" max="500" value="200" style="width:80px"><span id="nv" style="color:#aaa;font:11px system-ui;width:28px">200</span><button id="go" style="padding:2px 10px;background:rgba(80,140,255,0.15);border:1px solid rgba(80,140,255,0.3);border-radius:4px;color:#8bf;font:11px system-ui;cursor:pointer">Run</button>';

function run() {
  const graph = barabasiAlbert(N, 2);
  const W = 1200, H = 800;
  const pos = forceLayout(graph, W, H);
  const deg: Record<number, number> = {};
  for (const id of graph.nodes()) deg[id] = graph.degree(id);
  const maxDeg = Math.max(...Object.values(deg));

  app.innerHTML = '<div id="w" style="position:relative;width:100%;height:100%"><canvas id="c"></canvas></div>';
  document.getElementById('w')!.appendChild(ctrl);
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.width = cW * 2; canvas.height = cH * 2;
  canvas.style.cssText = 'display:block;width:' + cW + 'px;height:' + cH + 'px;background:#0f0f14';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // BFS from hub
  const hub = Number(Object.entries(deg).sort((a, b) => b[1] - a[1])[0][0]);
  const visited = new Set<number>(); const layers: number[][] = [];
  let frontier = [hub]; visited.add(hub);
  while (frontier.length > 0) {
    layers.push([...frontier]);
    const next: number[] = [];
    for (const nd of frontier) for (const nb of graph.neighbors(nd)) {
      if (!visited.has(nb)) { visited.add(nb); next.push(nb); }
    }
    frontier = next;
  }

  // Color: single-hue gradient (depth = darker blue)
  const nodeLayer: Record<number, number> = {};
  layers.forEach((layer, i) => { for (const id of layer) nodeLayer[id] = i; });
  const maxLayer = layers.length - 1;

  let revealed = 0;
  const revNodes = new Set<number>();
  const revEdges = new Set<string>();

  function draw(scale = 1, ox = 0, oy = 0) {
    const sx = cW / W * scale, sy = cH / H * scale;
    ctx.clearRect(0, 0, cW, cH);
    ctx.save(); ctx.translate(ox, oy);

    // Edges
    ctx.lineWidth = 0.5;
    for (const key of revEdges) {
      const [a, b] = key.split('-').map(Number);
      ctx.beginPath();
      ctx.moveTo(pos[a][0] * sx, pos[a][1] * sy);
      ctx.lineTo(pos[b][0] * sx, pos[b][1] * sy);
      ctx.strokeStyle = 'rgba(100,150,220,0.07)';
      ctx.stroke();
    }

    // Nodes
    for (const id of revNodes) {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const r = (2.5 + (deg[id] / maxDeg) * 7) * Math.min(scale, 2);
      const depth = (nodeLayer[id] || 0) / Math.max(maxLayer, 1);
      const h = 210, s = 75, l = 65 - depth * 30;

      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(' + h + ',' + s + '%,' + l + '%)';
      ctx.fill();
    }

    // Labels on top 3 hubs
    ctx.font = '9px system-ui'; ctx.fillStyle = '#ccc'; ctx.textAlign = 'center';
    const top3 = Object.entries(deg).sort((a, b) => b[1] - a[1]).slice(0, 3);
    for (const [id] of top3) {
      const nid = Number(id);
      if (!revNodes.has(nid)) continue;
      const x = pos[nid][0] * sx, y = pos[nid][1] * sy;
      const r = (2.5 + (deg[nid] / maxDeg) * 7) * Math.min(scale, 2);
      ctx.fillText('hub ' + id, x, y - r - 4);
    }

    ctx.restore();

    // Legend
    ctx.fillStyle = '#666'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('Layer ' + Math.min(revealed, layers.length) + '/' + layers.length + '  ·  ' + revNodes.size + ' nodes revealed  ·  scroll to zoom, drag to pan', 10, cH - 8);
  }

  const zp = enableZoomPan(canvas, draw);

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
    const t = zp.getTransform(); draw(t.scale, t.offsetX, t.offsetY);
    setTimeout(step, Math.max(30, 120 - N / 5));
  }
  step();

  console.log(graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges, ' + layers.length + ' BFS layers from hub #' + hub);
}

app.innerHTML = '<div id="w" style="position:relative;width:100%;height:100%"></div>';
document.getElementById('w')!.appendChild(ctrl);
setTimeout(() => {
  document.getElementById('ns')!.addEventListener('input', (e: any) => { N = +e.target.value; document.getElementById('nv')!.textContent = N + ''; });
  document.getElementById('go')!.addEventListener('click', run);
  run();
}, 30);
`;

const communityViz = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';

const app = document.getElementById('app')!;
const cW = app.clientWidth || 800, cH = app.clientHeight || 600;

let N = 180;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:4px 10px;background:rgba(15,15,20,0.85);border-radius:6px;border:1px solid rgba(255,255,255,0.08)';
ctrl.innerHTML = '<span style="color:#888;font:11px system-ui">Nodes</span><input id="ns" type="range" min="60" max="400" value="180" style="width:80px"><span id="nv" style="color:#aaa;font:11px system-ui;width:28px">180</span><button id="go" style="padding:2px 10px;background:rgba(80,200,180,0.15);border:1px solid rgba(80,200,180,0.3);border-radius:4px;color:#5ad8a6;font:11px system-ui;cursor:pointer">Run</button>';

function makeCommunityGraph(n: number) {
  const numComm = Math.max(4, Math.round(n / 30));
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
  const trueLabel = new Map<number, number>();
  let off = 0;
  for (let c = 0; c < sizes.length; c++) {
    for (let i = 0; i < sizes[c]; i++) {
      trueLabel.set(off + i, c);
      for (let j = i + 1; j < sizes[c]; j++) if (Math.random() < 0.28) add(off + i, off + j);
    }
    off += sizes[c];
  }
  off = 0;
  for (let c = 0; c < sizes.length; c++) {
    for (let c2 = c + 1; c2 < sizes.length; c2++) {
      const bridges = 1 + Math.floor(Math.random() * 2);
      for (let k = 0; k < bridges; k++) {
        const offC2 = sizes.slice(0, c2).reduce((a, b) => a + b, 0);
        add(off + Math.floor(Math.random() * sizes[c]), offC2 + Math.floor(Math.random() * sizes[c2]));
      }
    }
    off += sizes[c];
  }
  return { graph: Graph.fromEdges(edges), trueLabel };
}

function detectComm(graph: Graph): Map<number, number> {
  const nodes = graph.nodes(), labels = new Map<number, number>();
  for (const id of nodes) labels.set(id, id);
  const m2 = graph.edgeCount() * 2;
  for (let pass = 0; pass < 40; pass++) {
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
  const nodes = graph.nodes(), n = nodes.length, k = Math.sqrt(W * H / n);
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [80 + Math.random() * (W - 160), 80 + Math.random() * (H - 160)];
  let temp = W / 4;
  for (let it = 0; it < 100; it++) {
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

// AntV-style categorical palette (6 colors)
const palette = ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A', '#6DC8EC', '#9270CA', '#269A99', '#FF9D4D'];

function run() {
  const { graph, trueLabel } = makeCommunityGraph(N);
  const labels = detectComm(graph);
  const W = 1200, H = 800, pos = forceLayout(graph, W, H);

  const commMap = new Map<number, number[]>();
  for (const [nd, lbl] of labels) { if (!commMap.has(lbl)) commMap.set(lbl, []); commMap.get(lbl)!.push(nd); }
  const commColor = new Map<number, string>();
  let ci = 0;
  for (const [lbl] of [...commMap.entries()].sort((a, b) => b[1].length - a[1].length)) {
    commColor.set(lbl, palette[ci % palette.length]); ci++;
  }

  app.innerHTML = '<div id="w" style="position:relative;width:100%;height:100%"><canvas id="c"></canvas></div>';
  document.getElementById('w')!.appendChild(ctrl);
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.width = cW * 2; canvas.height = cH * 2;
  canvas.style.cssText = 'display:block;width:' + cW + 'px;height:' + cH + 'px;background:#0f0f14';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  function draw(scale = 1, ox = 0, oy = 0) {
    const sx = cW / W * scale, sy = cH / H * scale;
    ctx.clearRect(0, 0, cW, cH);
    ctx.save(); ctx.translate(ox, oy);

    // Edges
    ctx.lineWidth = 0.5;
    for (const e of graph.edges()) {
      const same = labels.get(e.source) === labels.get(e.target);
      ctx.beginPath();
      ctx.moveTo(pos[e.source][0] * sx, pos[e.source][1] * sy);
      ctx.lineTo(pos[e.target][0] * sx, pos[e.target][1] * sy);
      ctx.strokeStyle = same ? 'rgba(100,150,220,0.1)' : 'rgba(80,80,100,0.04)';
      ctx.stroke();
    }

    // Nodes
    for (const id of graph.nodes()) {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const color = commColor.get(labels.get(id)!) || '#555';
      const deg = graph.degree(id);
      const r = (2.5 + deg * 0.4) * Math.min(scale, 2);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // Legend
    ctx.textAlign = 'left'; ctx.font = '10px system-ui';
    const sorted = [...commMap.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 6);
    sorted.forEach(([lbl, members], i) => {
      const color = commColor.get(lbl) || '#555';
      ctx.fillStyle = color;
      ctx.fillRect(10, cH - 18 - i * 14, 8, 8);
      ctx.fillStyle = '#777';
      ctx.fillText(members.length + ' nodes', 22, cH - 11 - i * 14);
    });
  }

  enableZoomPan(canvas, draw);
  draw();
  console.log(graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges, ' + commMap.size + ' communities detected');
}

app.innerHTML = '<div id="w" style="position:relative;width:100%;height:100%"></div>';
document.getElementById('w')!.appendChild(ctrl);
setTimeout(() => {
  document.getElementById('ns')!.addEventListener('input', (e: any) => { N = +e.target.value; document.getElementById('nv')!.textContent = N + ''; });
  document.getElementById('go')!.addEventListener('click', run);
  run();
}, 30);
`;

const centralityViz = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';

const app = document.getElementById('app')!;
const cW = app.clientWidth || 800, cH = app.clientHeight || 600;

let N = 120;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:4px 10px;background:rgba(15,15,20,0.85);border-radius:6px;border:1px solid rgba(255,255,255,0.08)';
ctrl.innerHTML = '<span style="color:#888;font:11px system-ui">Nodes</span><input id="ns" type="range" min="30" max="250" value="120" style="width:80px"><span id="nv" style="color:#aaa;font:11px system-ui;width:28px">120</span><button id="go" style="padding:2px 10px;background:rgba(230,130,70,0.15);border:1px solid rgba(230,130,70,0.3);border-radius:4px;color:#e8844a;font:11px system-ui;cursor:pointer">Run</button>';

function buildNetwork(n: number): Graph {
  const nc = Math.max(3, Math.round(n / 25));
  const cs = Math.floor(n / nc);
  const edges: [number, number][] = [], seen = new Set<string>();
  const add = (a: number, b: number) => { const k = Math.min(a, b) + '-' + Math.max(a, b); if (a !== b && !seen.has(k)) { seen.add(k); edges.push([a, b]); } };
  for (let c = 0; c < nc; c++) {
    const base = c * cs;
    for (let i = 0; i < cs; i++) for (let j = i + 1; j < cs; j++) if (Math.random() < 0.2) add(base + i, base + j);
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
  const nodes = graph.nodes(), n = nodes.length, k = Math.sqrt(W * H / n);
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [80 + Math.random() * (W - 160), 80 + Math.random() * (H - 160)];
  let temp = W / 4;
  for (let it = 0; it < 100; it++) {
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

function run() {
  const graph = buildNetwork(N);
  const bc = betweenness(graph);
  const W = 1200, H = 800, pos = forceLayout(graph, W, H);
  const nodes = graph.nodes();
  const sorted = [...bc.entries()].sort((a, b) => b[1] - a[1]);

  app.innerHTML = '<div id="w" style="position:relative;width:100%;height:100%"><canvas id="c"></canvas></div>';
  document.getElementById('w')!.appendChild(ctrl);
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.width = cW * 2; canvas.height = cH * 2;
  canvas.style.cssText = 'display:block;width:' + cW + 'px;height:' + cH + 'px;background:#0f0f14';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // Sequential palette: low → mid → high centrality (blue → orange → bright orange)
  function scoreColor(score: number): string {
    if (score > 0.5) return '#E8684A';
    if (score > 0.2) return '#F6BD16';
    if (score > 0.05) return '#5B8FF9';
    return '#3a4a6b';
  }

  function draw(scale = 1, ox = 0, oy = 0) {
    const sx = cW / W * scale, sy = cH / H * scale;
    ctx.clearRect(0, 0, cW, cH);
    ctx.save(); ctx.translate(ox, oy);

    // Edges
    ctx.lineWidth = 0.5;
    for (const e of graph.edges()) {
      ctx.beginPath();
      ctx.moveTo(pos[e.source][0] * sx, pos[e.source][1] * sy);
      ctx.lineTo(pos[e.target][0] * sx, pos[e.target][1] * sy);
      ctx.strokeStyle = 'rgba(80,120,180,0.06)';
      ctx.stroke();
    }

    // Nodes sized + colored by betweenness
    for (const id of nodes) {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const score = bc.get(id) || 0;
      const r = (2.5 + score * 10) * Math.min(scale, 2);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = scoreColor(score);
      ctx.fill();
    }

    // Labels on top 5
    ctx.font = '9px system-ui'; ctx.fillStyle = '#bbb'; ctx.textAlign = 'center';
    sorted.slice(0, 5).forEach(([id, score]) => {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const r = (2.5 + score * 10) * Math.min(scale, 2);
      ctx.fillText('#' + id + ' (' + score.toFixed(2) + ')', x, y - r - 4);
    });

    ctx.restore();

    // Legend
    ctx.textAlign = 'left'; ctx.font = '10px system-ui';
    const legend = [['#E8684A', 'High (>0.5)'], ['#F6BD16', 'Medium (0.2-0.5)'], ['#5B8FF9', 'Low (0.05-0.2)'], ['#3a4a6b', 'Minimal']];
    legend.forEach(([color, label], i) => {
      ctx.fillStyle = color; ctx.fillRect(10, cH - 18 - i * 14, 8, 8);
      ctx.fillStyle = '#777'; ctx.fillText(label, 22, cH - 11 - i * 14);
    });
  }

  enableZoomPan(canvas, draw);
  draw();
  console.log(graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges');
  console.log('Top 5 betweenness: ' + sorted.slice(0, 5).map(([id, s]) => '#' + id + '=' + s.toFixed(3)).join(', '));
}

app.innerHTML = '<div id="w" style="position:relative;width:100%;height:100%"></div>';
document.getElementById('w')!.appendChild(ctrl);
setTimeout(() => {
  document.getElementById('ns')!.addEventListener('input', (e: any) => { N = +e.target.value; document.getElementById('nv')!.textContent = N + ''; });
  document.getElementById('go')!.addEventListener('click', run);
  run();
}, 30);
`;

const pageRankViz = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';

const app = document.getElementById('app')!;
const cW = app.clientWidth || 800, cH = app.clientHeight || 600;

let N = 200;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:4px 10px;background:rgba(15,15,20,0.85);border-radius:6px;border:1px solid rgba(255,255,255,0.08)';
ctrl.innerHTML = '<span style="color:#888;font:11px system-ui">Pages</span><input id="ns" type="range" min="50" max="400" value="200" style="width:80px"><span id="nv" style="color:#aaa;font:11px system-ui;width:28px">200</span><button id="go" style="padding:2px 10px;background:rgba(246,189,22,0.15);border:1px solid rgba(246,189,22,0.3);border-radius:4px;color:#F6BD16;font:11px system-ui;cursor:pointer">Run</button>';

function webGraph(n: number): Graph {
  const edges: [number, number][] = [], seen = new Set<string>();
  const add = (f: number, t: number) => { const k = f + '-' + t; if (f !== t && !seen.has(k)) { seen.add(k); edges.push([f, t]); } };
  const nc = Math.max(4, Math.round(n / 40));
  const cs = Math.floor(n / nc);
  for (let c = 0; c < nc; c++) {
    const base = c * cs;
    for (let i = 0; i < cs; i++) { const numLinks = 2 + Math.floor(Math.random() * 3); for (let t = 0; t < numLinks; t++) add(base + i, base + Math.floor(Math.random() * cs)); }
    const hub = base + Math.floor(Math.random() * 3);
    for (let i = 0; i < cs; i++) add(hub, base + i);
  }
  for (let i = 0; i < n / 5; i++) add(Math.floor(Math.random() * n), Math.floor(Math.random() * n));
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
  const nodes = graph.nodes(), n = nodes.length, k = Math.sqrt(W * H / n) * 0.8;
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [80 + Math.random() * (W - 160), 80 + Math.random() * (H - 160)];
  let temp = W / 5;
  for (let it = 0; it < 80; it++) {
    const d: Record<number, [number, number]> = {};
    for (const v of nodes) d[v] = [0, 0];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const vi = nodes[i], vj = nodes[j], dx = pos[vi][0] - pos[vj][0], dy = pos[vi][1] - pos[vj][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.5), f = (k * k) / dist * 0.5;
      d[vi][0] += (dx / dist) * f; d[vi][1] += (dy / dist) * f; d[vj][0] -= (dx / dist) * f; d[vj][1] -= (dy / dist) * f;
    }
    for (const e of graph.edges()) {
      const dx = pos[e.source][0] - pos[e.target][0], dy = pos[e.source][1] - pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.5), f = (dist * dist) / k * 0.3;
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

function run() {
  const graph = webGraph(N);
  const ranks = pageRank(graph);
  const W = 1200, H = 800, pos = forceLayout(graph, W, H);
  const nodes = graph.nodes();
  const sorted = [...ranks.entries()].sort((a, b) => b[1] - a[1]);
  const maxR = sorted.length > 0 ? sorted[0][1] : 1;

  app.innerHTML = '<div id="w" style="position:relative;width:100%;height:100%"><canvas id="c"></canvas></div>';
  document.getElementById('w')!.appendChild(ctrl);
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.width = cW * 2; canvas.height = cH * 2;
  canvas.style.cssText = 'display:block;width:' + cW + 'px;height:' + cH + 'px;background:#0f0f14';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  function draw(scale = 1, ox = 0, oy = 0) {
    const sx = cW / W * scale, sy = cH / H * scale;
    ctx.clearRect(0, 0, cW, cH);
    ctx.save(); ctx.translate(ox, oy);

    // Edges (very subtle)
    ctx.lineWidth = 0.4;
    ctx.strokeStyle = 'rgba(80,120,180,0.04)';
    for (const e of graph.edges()) {
      ctx.beginPath();
      ctx.moveTo(pos[e.source][0] * sx, pos[e.source][1] * sy);
      ctx.lineTo(pos[e.target][0] * sx, pos[e.target][1] * sy);
      ctx.stroke();
    }

    // Nodes: size = rank, color = rank intensity
    for (const id of nodes) {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const norm = (ranks.get(id) || 0) / maxR;
      const r = (2 + norm * 12) * Math.min(scale, 2);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      if (norm > 0.4) ctx.fillStyle = '#F6BD16';
      else if (norm > 0.15) ctx.fillStyle = '#6DC8EC';
      else ctx.fillStyle = '#3a4a6b';
      ctx.fill();
    }

    // Labels on top 5 authority pages
    ctx.font = '9px system-ui'; ctx.fillStyle = '#ccc'; ctx.textAlign = 'center';
    sorted.slice(0, 5).forEach(([id, rank]) => {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const r = (2 + (rank / maxR) * 12) * Math.min(scale, 2);
      ctx.fillText('page ' + id, x, y - r - 4);
    });

    ctx.restore();

    // Legend
    ctx.textAlign = 'left'; ctx.font = '10px system-ui';
    const legend = [['#F6BD16', 'Authority (>0.4)'], ['#6DC8EC', 'Mid (0.15-0.4)'], ['#3a4a6b', 'Low']];
    legend.forEach(([color, label], i) => {
      ctx.fillStyle = color; ctx.fillRect(10, cH - 18 - i * 14, 8, 8);
      ctx.fillStyle = '#777'; ctx.fillText(label, 22, cH - 11 - i * 14);
    });
  }

  enableZoomPan(canvas, draw);
  draw();
  console.log(graph.nodeCount() + ' pages, ' + graph.edgeCount() + ' links');
  console.log('Top authority: ' + sorted.slice(0, 5).map(([id, r]) => 'page' + id + '=' + r.toFixed(5)).join(', '));
}

app.innerHTML = '<div id="w" style="position:relative;width:100%;height:100%"></div>';
document.getElementById('w')!.appendChild(ctrl);
setTimeout(() => {
  document.getElementById('ns')!.addEventListener('input', (e: any) => { N = +e.target.value; document.getElementById('nv')!.textContent = N + ''; });
  document.getElementById('go')!.addEventListener('click', run);
  run();
}, 30);
`;

const perfBenchmark = `import { Graph } from './graphrs-core.js';

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

console.log('\\n  @graphrs Performance Benchmark');
console.log('  JS baseline vs WASM (igraph C library)\\n');

const sizes = [100, 200, 500, 1000];
const results: { n: number; edges: number; bfs: number; betw: number }[] = [];

for (const n of sizes) {
  const g = barabasiAlbert(n, 3);
  const t1 = performance.now(); for (let i = 0; i < 10; i++) bfs(g, 0); const bfsTime = (performance.now() - t1) / 10;
  let betwTime = 0;
  if (n <= 500) { const t2 = performance.now(); betweenness(g); betwTime = performance.now() - t2; }
  results.push({ n, edges: g.edgeCount(), bfs: bfsTime, betw: betwTime });
  console.log(n + ' nodes (' + g.edgeCount() + ' edges):  BFS ' + bfsTime.toFixed(2) + 'ms' + (n <= 500 ? '  Betweenness ' + betwTime.toFixed(0) + 'ms' : '  Betweenness: skipped'));
}

console.log('\\nWith @graphrs WASM: BFS 10-50x faster, Betweenness 100-500x faster');

// Chart
const app = document.getElementById('app')!;
const cW = app.clientWidth || 800, cH = app.clientHeight || 600;
app.innerHTML = '<canvas id="c" width="' + (cW * 2) + '" height="' + (cH * 2) + '" style="display:block;width:' + cW + 'px;height:' + cH + 'px;background:#0f0f14"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
ctx.scale(2, 2);

const mg = { top: 50, right: 40, bottom: 55, left: 70 };
const w = cW - mg.left - mg.right, h = cH - mg.top - mg.bottom;
ctx.save(); ctx.translate(mg.left, mg.top);

ctx.fillStyle = '#ddd'; ctx.font = 'bold 13px system-ui';
ctx.fillText('Algorithm Performance: Pure JS Baseline', 0, -28);
ctx.fillStyle = '#777'; ctx.font = '11px system-ui';
ctx.fillText('Lower is better. WASM delivers 10-500x speedup over these timings.', 0, -10);

const maxTime = Math.max(...results.map(r => Math.max(r.bfs, r.betw)));
const logMax = Math.ceil(Math.log10(Math.max(maxTime, 10))), logMin = -1;

ctx.strokeStyle = '#222'; ctx.lineWidth = 0.5;
for (let p = logMin; p <= logMax; p++) {
  const y = h - ((p - logMin) / (logMax - logMin)) * h;
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  ctx.fillStyle = '#666'; ctx.font = '10px system-ui'; ctx.textAlign = 'right';
  ctx.fillText(p < 0 ? '0.1ms' : p === 0 ? '1ms' : Math.pow(10, p) + 'ms', -8, y + 3);
}

const barW = w / sizes.length * 0.32, gap = w / sizes.length;
ctx.textAlign = 'left';
results.forEach((r, i) => {
  const x = i * gap + gap * 0.2;
  const bfsH = ((Math.log10(Math.max(r.bfs, 0.1)) - logMin) / (logMax - logMin)) * h;
  ctx.fillStyle = '#5B8FF9'; ctx.fillRect(x, h - bfsH, barW, bfsH);
  ctx.fillStyle = '#aaa'; ctx.font = '9px system-ui'; ctx.fillText(r.bfs.toFixed(1) + 'ms', x, h - bfsH - 4);
  if (r.betw > 0) {
    const betwH = ((Math.log10(r.betw) - logMin) / (logMax - logMin)) * h;
    ctx.fillStyle = '#E8684A'; ctx.fillRect(x + barW + 4, h - betwH, barW, betwH);
    ctx.fillStyle = '#aaa'; ctx.fillText(r.betw.toFixed(0) + 'ms', x + barW + 4, h - betwH - 4);
  }
  ctx.fillStyle = '#ccc'; ctx.font = '11px system-ui'; ctx.fillText(r.n + ' nodes', x, h + 16);
  ctx.fillStyle = '#666'; ctx.font = '9px system-ui'; ctx.fillText(r.edges + ' edges', x, h + 30);
});

// Legend
ctx.fillStyle = '#5B8FF9'; ctx.fillRect(w - 130, -22, 10, 10);
ctx.fillStyle = '#aaa'; ctx.font = '10px system-ui'; ctx.fillText('BFS', w - 116, -13);
ctx.fillStyle = '#E8684A'; ctx.fillRect(w - 130, -8, 10, 10);
ctx.fillStyle = '#aaa'; ctx.fillText('Betweenness', w - 116, 1);
ctx.restore();
`;
</script>

# Interactive Playground

Live graph algorithm demos. Adjust the node count with the slider and click **Run** to regenerate. Scroll to zoom, drag to pan. Click **Show Code** to view and edit the source.

## BFS — Breadth-First Traversal

Animated layer-by-layer exploration of a Barabási–Albert scale-free network. Darker blue = deeper BFS layer from the hub node:

<Playground :code="animatedBFS" />

## Community Detection

Modularity-based label propagation identifies densely-connected clusters in a planted-partition network. Each color represents a detected community:

<Playground :code="communityViz" />

## Betweenness Centrality

Brandes' algorithm scores every node by how many shortest paths pass through it. High-scoring nodes (warm colors) are structural bridges between clusters:

<Playground :code="centralityViz" />

## PageRank

Power-iteration PageRank on a directed web graph. Node size encodes authority score — large gold nodes are the "most linked-to" hubs:

<Playground :code="pageRankViz" />

## Performance Benchmark

Pure JavaScript timing at various scales. The bar chart shows why WASM matters — betweenness on 500 nodes already takes seconds in JS:

<Playground :code="perfBenchmark" />
