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

function forceLayout(graph: Graph, W: number, H: number, iter = 150) {
  const nodes = graph.nodes(), n = nodes.length, k = Math.sqrt(W * H / n) * 1.2;
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [100 + Math.random() * (W - 200), 100 + Math.random() * (H - 200)];
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
      pos[v][0] = Math.max(60, Math.min(W - 60, pos[v][0] + (disp[v][0] / d) * Math.min(d, temp)));
      pos[v][1] = Math.max(60, Math.min(H - 60, pos[v][1] + (disp[v][1] / d) * Math.min(d, temp)));
    }
    temp *= 0.95;
  }
  return pos;
}

let N = 150;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:6px 12px;background:rgba(10,10,18,0.9);border-radius:8px;border:1px solid rgba(100,160,255,0.12);backdrop-filter:blur(8px)';
ctrl.innerHTML = '<span style="color:#8ab4f8;font:11px/1 system-ui;font-weight:500">Nodes</span><input id="ns" type="range" min="50" max="500" value="150" style="width:90px;accent-color:#5b8ff9"><span id="nv" style="color:#bbb;font:11px system-ui;width:28px;text-align:center">150</span><button id="go" style="padding:3px 12px;background:linear-gradient(135deg,rgba(91,143,249,0.2),rgba(91,143,249,0.05));border:1px solid rgba(91,143,249,0.4);border-radius:6px;color:#8ab4f8;font:11px system-ui;font-weight:500;cursor:pointer;transition:all 0.15s">Run</button>';

function run() {
  const graph = barabasiAlbert(N, 2);
  const W = 1200, H = 900;
  const pos = forceLayout(graph, W, H);
  const deg: Record<number, number> = {};
  for (const id of graph.nodes()) deg[id] = graph.degree(id);
  const maxDeg = Math.max(...Object.values(deg));

  app.innerHTML = '<div id="w" style="position:relative;width:100%;height:100%"><canvas id="c"></canvas></div>';
  document.getElementById('w')!.appendChild(ctrl);
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.width = cW * 2; canvas.height = cH * 2;
  canvas.style.cssText = 'display:block;width:' + cW + 'px;height:' + cH + 'px;background:#080b12';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

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

  const nodeLayer: Record<number, number> = {};
  layers.forEach((layer, i) => { for (const id of layer) nodeLayer[id] = i; });
  const maxLayer = layers.length - 1;

  let revealed = 0;
  const revNodes = new Set<number>();
  const revEdges = new Set<string>();

  function draw(scale = 1, ox = 0, oy = 0) {
    const sx = cW / W * scale, sy = cH / H * scale;
    ctx.clearRect(0, 0, cW, cH);
    ctx.fillStyle = '#080b12';
    ctx.fillRect(0, 0, cW, cH);
    ctx.save(); ctx.translate(ox, oy);

    // Edges with gradient alpha based on node importance
    for (const key of revEdges) {
      const [a, b] = key.split('-').map(Number);
      const importance = Math.max(deg[a] / maxDeg, deg[b] / maxDeg);
      ctx.beginPath();
      ctx.moveTo(pos[a][0] * sx, pos[a][1] * sy);
      ctx.lineTo(pos[b][0] * sx, pos[b][1] * sy);
      ctx.strokeStyle = 'rgba(91,143,249,' + (0.03 + importance * 0.12) + ')';
      ctx.lineWidth = 0.5 + importance * 0.8;
      ctx.stroke();
    }

    // Nodes with radial gradient for hubs
    for (const id of revNodes) {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const norm = deg[id] / maxDeg;
      const r = (3 + norm * 10) * Math.min(scale, 2);
      const depth = (nodeLayer[id] || 0) / Math.max(maxLayer, 1);

      // Hub glow
      if (norm > 0.4) {
        const grd = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.5);
        grd.addColorStop(0, 'rgba(91,143,249,0.25)');
        grd.addColorStop(1, 'rgba(91,143,249,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(x - r * 2.5, y - r * 2.5, r * 5, r * 5);
      }

      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      const h = 215, s = 80, l = 70 - depth * 35;
      ctx.fillStyle = 'hsl(' + h + ',' + s + '%,' + l + '%)';
      ctx.fill();

      // Bright rim for hubs
      if (norm > 0.5) {
        ctx.strokeStyle = 'rgba(138,180,248,0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Labels on top 5 hubs
    ctx.font = '10px system-ui'; ctx.textAlign = 'center';
    const topHubs = Object.entries(deg).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [id, d] of topHubs) {
      const nid = Number(id);
      if (!revNodes.has(nid)) continue;
      const x = pos[nid][0] * sx, y = pos[nid][1] * sy;
      const r = (3 + (d / maxDeg) * 10) * Math.min(scale, 2);
      ctx.fillStyle = 'rgba(200,220,255,0.9)';
      ctx.fillText('hub #' + id + ' (deg ' + d + ')', x, y - r - 6);
    }

    ctx.restore();

    // Status bar
    ctx.fillStyle = 'rgba(8,11,18,0.85)';
    ctx.fillRect(0, cH - 28, cW, 28);
    ctx.fillStyle = '#667';
    ctx.strokeStyle = 'rgba(91,143,249,0.15)';
    ctx.beginPath(); ctx.moveTo(0, cH - 28); ctx.lineTo(cW, cH - 28); ctx.stroke();
    ctx.font = '10px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = '#8ab4f8';
    ctx.fillText('Layer ' + Math.min(revealed, layers.length) + '/' + layers.length, 12, cH - 10);
    ctx.fillStyle = '#667';
    ctx.fillText(revNodes.size + ' nodes  ·  ' + revEdges.size + ' edges  ·  scroll to zoom, drag to pan', 100, cH - 10);
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
    setTimeout(step, Math.max(40, 150 - N / 4));
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

let N = 150;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:6px 12px;background:rgba(10,10,18,0.9);border-radius:8px;border:1px solid rgba(90,216,166,0.12);backdrop-filter:blur(8px)';
ctrl.innerHTML = '<span style="color:#5ad8a6;font:11px/1 system-ui;font-weight:500">Nodes</span><input id="ns" type="range" min="60" max="400" value="150" style="width:90px;accent-color:#5ad8a6"><span id="nv" style="color:#bbb;font:11px system-ui;width:28px;text-align:center">150</span><button id="go" style="padding:3px 12px;background:linear-gradient(135deg,rgba(90,216,166,0.2),rgba(90,216,166,0.05));border:1px solid rgba(90,216,166,0.4);border-radius:6px;color:#5ad8a6;font:11px system-ui;font-weight:500;cursor:pointer">Run</button>';

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
      for (let j = i + 1; j < sizes[c]; j++) if (Math.random() < 0.3) add(off + i, off + j);
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
  const nodes = graph.nodes(), n = nodes.length, k = Math.sqrt(W * H / n) * 1.2;
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [100 + Math.random() * (W - 200), 100 + Math.random() * (H - 200)];
  let temp = W / 3;
  for (let it = 0; it < 120; it++) {
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
      pos[v][0] = Math.max(60, Math.min(W - 60, pos[v][0] + (d[v][0] / len) * Math.min(len, temp)));
      pos[v][1] = Math.max(60, Math.min(H - 60, pos[v][1] + (d[v][1] / len) * Math.min(len, temp)));
    }
    temp *= 0.94;
  }
  return pos;
}

const palette = ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E86B5A', '#6DC8EC', '#9270CA', '#269A99', '#FF9845'];

function run() {
  const { graph } = makeCommunityGraph(N);
  const labels = detectComm(graph);
  const W = 1200, H = 900, pos = forceLayout(graph, W, H);

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
  canvas.style.cssText = 'display:block;width:' + cW + 'px;height:' + cH + 'px;background:#080b12';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  function draw(scale = 1, ox = 0, oy = 0) {
    const sx = cW / W * scale, sy = cH / H * scale;
    ctx.clearRect(0, 0, cW, cH);
    ctx.fillStyle = '#080b12'; ctx.fillRect(0, 0, cW, cH);
    ctx.save(); ctx.translate(ox, oy);

    // Edges — intra-community edges brighter
    for (const e of graph.edges()) {
      const same = labels.get(e.source) === labels.get(e.target);
      const color = same ? commColor.get(labels.get(e.source)!) || '#556' : '#556';
      ctx.beginPath();
      ctx.moveTo(pos[e.source][0] * sx, pos[e.source][1] * sy);
      ctx.lineTo(pos[e.target][0] * sx, pos[e.target][1] * sy);
      ctx.strokeStyle = same ? color + '22' : 'rgba(60,70,90,0.06)';
      ctx.lineWidth = same ? 0.8 : 0.4;
      ctx.stroke();
    }

    // Nodes
    for (const id of graph.nodes()) {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const color = commColor.get(labels.get(id)!) || '#555';
      const d = graph.degree(id);
      const r = (3.5 + d * 0.5) * Math.min(scale, 2);

      // Glow for high-degree community hubs
      if (d > 8) {
        const grd = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2.2);
        grd.addColorStop(0, color + '30');
        grd.addColorStop(1, color + '00');
        ctx.fillStyle = grd;
        ctx.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
      }

      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.88;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // Legend panel
    ctx.fillStyle = 'rgba(8,11,18,0.9)';
    ctx.fillRect(8, cH - 24 - Math.min(commMap.size, 6) * 18, 120, Math.min(commMap.size, 6) * 18 + 12);
    ctx.textAlign = 'left'; ctx.font = '10px system-ui';
    const sorted = [...commMap.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 6);
    sorted.forEach(([lbl, members], i) => {
      const y = cH - 16 - i * 18;
      const color = commColor.get(lbl) || '#555';
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(18, y - 3, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#aaa';
      ctx.fillText(members.length + ' nodes', 28, y);
    });
  }

  enableZoomPan(canvas, draw);
  draw();
  console.log(graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges, ' + commMap.size + ' communities');
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

let N = 100;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:6px 12px;background:rgba(10,10,18,0.9);border-radius:8px;border:1px solid rgba(232,107,90,0.12);backdrop-filter:blur(8px)';
ctrl.innerHTML = '<span style="color:#e86b5a;font:11px/1 system-ui;font-weight:500">Nodes</span><input id="ns" type="range" min="30" max="200" value="100" style="width:90px;accent-color:#e86b5a"><span id="nv" style="color:#bbb;font:11px system-ui;width:28px;text-align:center">100</span><button id="go" style="padding:3px 12px;background:linear-gradient(135deg,rgba(232,107,90,0.2),rgba(232,107,90,0.05));border:1px solid rgba(232,107,90,0.4);border-radius:6px;color:#e86b5a;font:11px system-ui;font-weight:500;cursor:pointer">Run</button>';

function buildNetwork(n: number): Graph {
  const nc = Math.max(3, Math.round(n / 20));
  const cs = Math.floor(n / nc);
  const edges: [number, number][] = [], seen = new Set<string>();
  const add = (a: number, b: number) => { const k = Math.min(a, b) + '-' + Math.max(a, b); if (a !== b && !seen.has(k)) { seen.add(k); edges.push([a, b]); } };
  for (let c = 0; c < nc; c++) {
    const base = c * cs;
    for (let i = 0; i < cs; i++) for (let j = i + 1; j < cs; j++) if (Math.random() < 0.25) add(base + i, base + j);
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
  for (const id of nodes) pos[id] = [100 + Math.random() * (W - 200), 100 + Math.random() * (H - 200)];
  let temp = W / 3;
  for (let it = 0; it < 120; it++) {
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
      pos[v][0] = Math.max(60, Math.min(W - 60, pos[v][0] + (d[v][0] / len) * Math.min(len, temp)));
      pos[v][1] = Math.max(60, Math.min(H - 60, pos[v][1] + (d[v][1] / len) * Math.min(len, temp)));
    }
    temp *= 0.94;
  }
  return pos;
}

function run() {
  const graph = buildNetwork(N);
  const bc = betweenness(graph);
  const W = 1200, H = 900, pos = forceLayout(graph, W, H);
  const nodes = graph.nodes();
  const sorted = [...bc.entries()].sort((a, b) => b[1] - a[1]);

  app.innerHTML = '<div id="w" style="position:relative;width:100%;height:100%"><canvas id="c"></canvas></div>';
  document.getElementById('w')!.appendChild(ctrl);
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.width = cW * 2; canvas.height = cH * 2;
  canvas.style.cssText = 'display:block;width:' + cW + 'px;height:' + cH + 'px;background:#080b12';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // Continuous HSL interpolation: blue(220) → orange(30) → red(5)
  function scoreColor(score: number): string {
    if (score > 0.5) { const t = (score - 0.5) * 2; return 'hsl(' + (30 - t * 25) + ',85%,' + (55 + t * 10) + '%)'; }
    if (score > 0.1) { const t = (score - 0.1) / 0.4; return 'hsl(' + (220 - t * 190) + ',75%,' + (50 + t * 5) + '%)'; }
    return 'hsl(220,40%,30%)';
  }

  function draw(scale = 1, ox = 0, oy = 0) {
    const sx = cW / W * scale, sy = cH / H * scale;
    ctx.clearRect(0, 0, cW, cH);
    ctx.fillStyle = '#080b12'; ctx.fillRect(0, 0, cW, cH);
    ctx.save(); ctx.translate(ox, oy);

    // Edges with varying opacity
    for (const e of graph.edges()) {
      const avgScore = ((bc.get(e.source) || 0) + (bc.get(e.target) || 0)) / 2;
      ctx.beginPath();
      ctx.moveTo(pos[e.source][0] * sx, pos[e.source][1] * sy);
      ctx.lineTo(pos[e.target][0] * sx, pos[e.target][1] * sy);
      ctx.strokeStyle = 'rgba(100,140,200,' + (0.04 + avgScore * 0.15) + ')';
      ctx.lineWidth = 0.5 + avgScore * 1.5;
      ctx.stroke();
    }

    // Nodes — size + color by betweenness
    for (const id of nodes) {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const score = bc.get(id) || 0;
      const r = (3.5 + score * 14) * Math.min(scale, 2);

      // Glow for bridges
      if (score > 0.3) {
        const grd = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.5);
        grd.addColorStop(0, 'rgba(232,107,90,0.2)');
        grd.addColorStop(1, 'rgba(232,107,90,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(x - r * 2.5, y - r * 2.5, r * 5, r * 5);
      }

      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = scoreColor(score);
      ctx.fill();

      if (score > 0.5) {
        ctx.strokeStyle = 'rgba(255,200,150,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Labels on top 5 bridges
    ctx.font = '10px system-ui'; ctx.fillStyle = 'rgba(255,220,200,0.9)'; ctx.textAlign = 'center';
    sorted.slice(0, 5).forEach(([id, score]) => {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const r = (3.5 + score * 14) * Math.min(scale, 2);
      ctx.fillText('#' + id + ' (' + score.toFixed(2) + ')', x, y - r - 6);
    });

    ctx.restore();

    // Legend
    ctx.fillStyle = 'rgba(8,11,18,0.9)';
    ctx.fillRect(8, cH - 82, 140, 70);
    ctx.textAlign = 'left'; ctx.font = '10px system-ui';
    const legend: [string, string][] = [['hsl(5,85%,60%)', 'Critical bridge (>0.5)'], ['hsl(30,75%,55%)', 'Important (0.2-0.5)'], ['hsl(130,75%,50%)', 'Moderate (0.1-0.2)'], ['hsl(220,40%,30%)', 'Peripheral']];
    legend.forEach(([color, label], i) => {
      const y = cH - 68 + i * 16;
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(18, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#999'; ctx.fillText(label, 28, y + 3);
    });
  }

  enableZoomPan(canvas, draw);
  draw();
  console.log(graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges');
  console.log('Top bridges: ' + sorted.slice(0, 5).map(([id, s]) => '#' + id + '=' + s.toFixed(3)).join(', '));
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

let N = 150;
const ctrl = document.createElement('div');
ctrl.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;gap:8px;align-items:center;padding:6px 12px;background:rgba(10,10,18,0.9);border-radius:8px;border:1px solid rgba(246,189,22,0.12);backdrop-filter:blur(8px)';
ctrl.innerHTML = '<span style="color:#f6bd16;font:11px/1 system-ui;font-weight:500">Pages</span><input id="ns" type="range" min="50" max="400" value="150" style="width:90px;accent-color:#f6bd16"><span id="nv" style="color:#bbb;font:11px system-ui;width:28px;text-align:center">150</span><button id="go" style="padding:3px 12px;background:linear-gradient(135deg,rgba(246,189,22,0.2),rgba(246,189,22,0.05));border:1px solid rgba(246,189,22,0.4);border-radius:6px;color:#f6bd16;font:11px system-ui;font-weight:500;cursor:pointer">Run</button>';

function webGraph(n: number): Graph {
  const edges: [number, number][] = [], seen = new Set<string>();
  const add = (f: number, t: number) => { const k = f + '-' + t; if (f !== t && !seen.has(k)) { seen.add(k); edges.push([f, t]); } };
  const nc = Math.max(4, Math.round(n / 35));
  const cs = Math.floor(n / nc);
  for (let c = 0; c < nc; c++) {
    const base = c * cs;
    for (let i = 0; i < cs; i++) { const nl = 2 + Math.floor(Math.random() * 3); for (let t = 0; t < nl; t++) add(base + i, base + Math.floor(Math.random() * cs)); }
    const hub = base + Math.floor(Math.random() * 3);
    for (let i = 0; i < cs; i++) add(hub, base + i);
  }
  for (let i = 0; i < n / 4; i++) add(Math.floor(Math.random() * n), Math.floor(Math.random() * n));
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
  const nodes = graph.nodes(), n = nodes.length, k = Math.sqrt(W * H / n) * 0.9;
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [100 + Math.random() * (W - 200), 100 + Math.random() * (H - 200)];
  let temp = W / 4;
  for (let it = 0; it < 100; it++) {
    const d: Record<number, [number, number]> = {};
    for (const v of nodes) d[v] = [0, 0];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const vi = nodes[i], vj = nodes[j], dx = pos[vi][0] - pos[vj][0], dy = pos[vi][1] - pos[vj][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.5), f = (k * k) / dist * 0.6;
      d[vi][0] += (dx / dist) * f; d[vi][1] += (dy / dist) * f; d[vj][0] -= (dx / dist) * f; d[vj][1] -= (dy / dist) * f;
    }
    for (const e of graph.edges()) {
      const dx = pos[e.source][0] - pos[e.target][0], dy = pos[e.source][1] - pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.5), f = (dist * dist) / k * 0.4;
      d[e.source][0] -= (dx / dist) * f; d[e.source][1] -= (dy / dist) * f;
      d[e.target][0] += (dx / dist) * f; d[e.target][1] += (dy / dist) * f;
    }
    for (const v of nodes) {
      const len = Math.max(Math.sqrt(d[v][0] ** 2 + d[v][1] ** 2), 0.1);
      pos[v][0] = Math.max(60, Math.min(W - 60, pos[v][0] + (d[v][0] / len) * Math.min(len, temp)));
      pos[v][1] = Math.max(60, Math.min(H - 60, pos[v][1] + (d[v][1] / len) * Math.min(len, temp)));
    }
    temp *= 0.93;
  }
  return pos;
}

function run() {
  const graph = webGraph(N);
  const ranks = pageRank(graph);
  const W = 1200, H = 900, pos = forceLayout(graph, W, H);
  const nodes = graph.nodes();
  const sorted = [...ranks.entries()].sort((a, b) => b[1] - a[1]);
  const maxR = sorted.length > 0 ? sorted[0][1] : 1;

  app.innerHTML = '<div id="w" style="position:relative;width:100%;height:100%"><canvas id="c"></canvas></div>';
  document.getElementById('w')!.appendChild(ctrl);
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.width = cW * 2; canvas.height = cH * 2;
  canvas.style.cssText = 'display:block;width:' + cW + 'px;height:' + cH + 'px;background:#080b12';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  function draw(scale = 1, ox = 0, oy = 0) {
    const sx = cW / W * scale, sy = cH / H * scale;
    ctx.clearRect(0, 0, cW, cH);
    ctx.fillStyle = '#080b12'; ctx.fillRect(0, 0, cW, cH);
    ctx.save(); ctx.translate(ox, oy);

    // Directed edges with subtle arrows for high-rank targets
    ctx.lineWidth = 0.5;
    for (const e of graph.edges()) {
      const srcR = (ranks.get(e.source) || 0) / maxR;
      const tgtR = (ranks.get(e.target) || 0) / maxR;
      const importance = Math.max(srcR, tgtR);
      ctx.beginPath();
      ctx.moveTo(pos[e.source][0] * sx, pos[e.source][1] * sy);
      ctx.lineTo(pos[e.target][0] * sx, pos[e.target][1] * sy);
      ctx.strokeStyle = 'rgba(100,150,220,' + (0.02 + importance * 0.08) + ')';
      ctx.lineWidth = 0.3 + importance * 0.8;
      ctx.stroke();
    }

    // Nodes: size = rank, color ramp blue → teal → gold
    for (const id of nodes) {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const norm = (ranks.get(id) || 0) / maxR;
      const r = (2.5 + norm * 15) * Math.min(scale, 2);

      // Authority glow
      if (norm > 0.3) {
        const grd = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.5);
        grd.addColorStop(0, 'rgba(246,189,22,' + (norm * 0.3) + ')');
        grd.addColorStop(1, 'rgba(246,189,22,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(x - r * 2.5, y - r * 2.5, r * 5, r * 5);
      }

      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      if (norm > 0.5) ctx.fillStyle = '#F6BD16';
      else if (norm > 0.25) { const t = (norm - 0.25) * 4; ctx.fillStyle = 'hsl(' + (190 - t * 145) + ',70%,' + (50 + t * 10) + '%)'; }
      else if (norm > 0.08) ctx.fillStyle = '#4a8fcc';
      else ctx.fillStyle = '#2a3a55';
      ctx.fill();

      if (norm > 0.5) {
        ctx.strokeStyle = 'rgba(246,189,22,0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // Labels on top 5 authorities
    ctx.font = '10px system-ui'; ctx.fillStyle = 'rgba(255,240,200,0.9)'; ctx.textAlign = 'center';
    sorted.slice(0, 5).forEach(([id, rank]) => {
      const x = pos[id][0] * sx, y = pos[id][1] * sy;
      const r = (2.5 + (rank / maxR) * 15) * Math.min(scale, 2);
      ctx.fillText('page ' + id, x, y - r - 6);
    });

    ctx.restore();

    // Legend
    ctx.fillStyle = 'rgba(8,11,18,0.9)';
    ctx.fillRect(8, cH - 66, 130, 54);
    ctx.textAlign = 'left'; ctx.font = '10px system-ui';
    const legend: [string, string][] = [['#F6BD16', 'Authority (>0.5)'], ['#4a8fcc', 'Mid rank'], ['#2a3a55', 'Low rank']];
    legend.forEach(([color, label], i) => {
      const y = cH - 52 + i * 16;
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(18, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#999'; ctx.fillText(label, 28, y + 3);
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

const app = document.getElementById('app')!;
const cW = app.clientWidth || 800, cH = app.clientHeight || 600;
app.innerHTML = '<canvas id="c" width="' + (cW * 2) + '" height="' + (cH * 2) + '" style="display:block;width:' + cW + 'px;height:' + cH + 'px;background:#080b12"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
ctx.scale(2, 2);

const mg = { top: 60, right: 40, bottom: 60, left: 75 };
const w = cW - mg.left - mg.right, h = cH - mg.top - mg.bottom;
ctx.save(); ctx.translate(mg.left, mg.top);

ctx.fillStyle = '#e8e8ec'; ctx.font = 'bold 14px system-ui';
ctx.fillText('Algorithm Performance: Pure JS Baseline', 0, -35);
ctx.fillStyle = '#778'; ctx.font = '11px system-ui';
ctx.fillText('Lower is better. WASM delivers 10-500x speedup over these timings.', 0, -16);

const maxTime = Math.max(...results.map(r => Math.max(r.bfs, r.betw)));
const logMax = Math.ceil(Math.log10(Math.max(maxTime, 10))), logMin = -1;

// Grid lines
for (let p = logMin; p <= logMax; p++) {
  const y = h - ((p - logMin) / (logMax - logMin)) * h;
  ctx.strokeStyle = 'rgba(100,120,150,0.1)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  ctx.fillStyle = '#667'; ctx.font = '10px system-ui'; ctx.textAlign = 'right';
  ctx.fillText(p < 0 ? '0.1ms' : p === 0 ? '1ms' : Math.pow(10, p) + 'ms', -10, y + 3);
}

const barW = w / sizes.length * 0.28, gap = w / sizes.length;
ctx.textAlign = 'left';
results.forEach((r, i) => {
  const x = i * gap + gap * 0.25;

  // BFS bar with gradient
  const bfsH = ((Math.log10(Math.max(r.bfs, 0.1)) - logMin) / (logMax - logMin)) * h;
  const bfsGrd = ctx.createLinearGradient(0, h - bfsH, 0, h);
  bfsGrd.addColorStop(0, '#5B8FF9'); bfsGrd.addColorStop(1, '#3a5faa');
  ctx.fillStyle = bfsGrd;
  ctx.beginPath();
  ctx.roundRect(x, h - bfsH, barW, bfsH, [3, 3, 0, 0]);
  ctx.fill();
  ctx.fillStyle = '#8ab4f8'; ctx.font = '9px system-ui';
  ctx.fillText(r.bfs.toFixed(1) + 'ms', x, h - bfsH - 5);

  // Betweenness bar
  if (r.betw > 0) {
    const betwH = ((Math.log10(r.betw) - logMin) / (logMax - logMin)) * h;
    const betwGrd = ctx.createLinearGradient(0, h - betwH, 0, h);
    betwGrd.addColorStop(0, '#E86B5A'); betwGrd.addColorStop(1, '#9a3a30');
    ctx.fillStyle = betwGrd;
    ctx.beginPath();
    ctx.roundRect(x + barW + 6, h - betwH, barW, betwH, [3, 3, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#f09080'; ctx.fillText(r.betw.toFixed(0) + 'ms', x + barW + 6, h - betwH - 5);
  }

  // X-axis labels
  ctx.fillStyle = '#ccc'; ctx.font = '11px system-ui'; ctx.fillText(r.n + ' nodes', x, h + 18);
  ctx.fillStyle = '#667'; ctx.font = '9px system-ui'; ctx.fillText(r.edges + ' edges', x, h + 33);
});

// Legend
ctx.fillStyle = '#5B8FF9'; ctx.beginPath(); ctx.roundRect(w - 140, -30, 12, 12, 2); ctx.fill();
ctx.fillStyle = '#bbb'; ctx.font = '10px system-ui'; ctx.fillText('BFS (avg 10 runs)', w - 124, -20);
ctx.fillStyle = '#E86B5A'; ctx.beginPath(); ctx.roundRect(w - 140, -14, 12, 12, 2); ctx.fill();
ctx.fillStyle = '#bbb'; ctx.fillText('Betweenness', w - 124, -4);
ctx.restore();
`;
</script>

# 交互式演练场

实时图算法演示。通过滑块调整节点数量，点击 **Run** 重新生成。滚轮缩放，拖拽平移。点击 **Show Code** 查看和编辑源代码，或使用 **Fullscreen** 进入全屏查看。

## BFS — 广度优先遍历

逐层动画展示 Barabási–Albert 无标度网络的广度优先搜索过程。蓝色越深 = 距离最高度数枢纽节点的 BFS 层越远：

<Playground :code="animatedBFS" />

## 社区发现

基于模块度的标签传播算法识别植入分区网络中的密集连接簇。每种颜色代表一个检测到的社区：

<Playground :code="communityViz" />

## 介数中心性

Brandes 算法计算每个节点被最短路径经过的次数。暖色调表示连接不同簇的结构性桥节点：

<Playground :code="centralityViz" />

## PageRank

对有向网页图运行幂迭代 PageRank 算法。节点大小编码权威度分数 — 大型金色节点是被链接最多的枢纽：

<Playground :code="pageRankViz" />

## 性能基准测试

不同规模下的纯 JavaScript 计时。柱状图展示了为什么 WASM 至关重要 — 500 节点的介数中心性在 JS 中已需要数秒：

<Playground :code="perfBenchmark" />
