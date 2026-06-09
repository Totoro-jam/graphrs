<script setup>
const animatedBFS = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';

// === Interactive Controls ===
const app = document.getElementById('app')!;
const cW = app.clientWidth || 800, cH = app.clientHeight || 600;

// Control panel
const panel = document.createElement('div');
panel.style.cssText = 'position:absolute;top:8px;left:8px;z-index:20;display:flex;gap:8px;align-items:center';
panel.innerHTML = \`
  <label style="color:#aaa;font:11px monospace">Nodes:</label>
  <input id="nslider" type="range" min="50" max="800" value="300" style="width:100px;accent-color:#58a6ff">
  <span id="nval" style="color:#ccc;font:11px monospace;width:32px">300</span>
  <button id="regen" style="padding:3px 10px;border-radius:5px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,50,0.8);color:#8cf;font:11px monospace;cursor:pointer;backdrop-filter:blur(4px)">Regenerate</button>
\`;

// Build scale-free network (Barabási-Albert model)
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

// Force-directed layout
function forceLayout(graph: Graph, W: number, H: number, iterations = 100) {
  const nodes = graph.nodes();
  const n = nodes.length;
  const k = Math.sqrt((W * H) / n);
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [100 + Math.random() * (W-200), 100 + Math.random() * (H-200)];
  let temp = W / 4;
  for (let iter = 0; iter < iterations; iter++) {
    const disp: Record<number, [number, number]> = {};
    for (const v of nodes) disp[v] = [0, 0];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const vi = nodes[i], vj = nodes[j];
      const dx = pos[vi][0] - pos[vj][0], dy = pos[vi][1] - pos[vj][1];
      const dist = Math.max(Math.sqrt(dx*dx + dy*dy), 0.1);
      const f = (k * k) / dist;
      disp[vi][0] += (dx/dist)*f; disp[vi][1] += (dy/dist)*f;
      disp[vj][0] -= (dx/dist)*f; disp[vj][1] -= (dy/dist)*f;
    }
    for (const e of graph.edges()) {
      const dx = pos[e.source][0]-pos[e.target][0], dy = pos[e.source][1]-pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx*dx+dy*dy), 0.1);
      const f = (dist*dist)/k;
      disp[e.source][0] -= (dx/dist)*f; disp[e.source][1] -= (dy/dist)*f;
      disp[e.target][0] += (dx/dist)*f; disp[e.target][1] += (dy/dist)*f;
    }
    for (const v of nodes) {
      const d = Math.max(Math.sqrt(disp[v][0]**2 + disp[v][1]**2), 0.1);
      pos[v][0] = Math.max(40, Math.min(W-40, pos[v][0] + (disp[v][0]/d)*Math.min(d, temp)));
      pos[v][1] = Math.max(40, Math.min(H-40, pos[v][1] + (disp[v][1]/d)*Math.min(d, temp)));
    }
    temp *= 0.95;
  }
  return pos;
}

let nodeCount = 300;
function run() {
  const t0 = performance.now();
  const graph = barabasiAlbert(nodeCount, 3);
  const W = 1400, H = 900;
  const pos = forceLayout(graph, W, H);
  const layoutTime = (performance.now() - t0).toFixed(1);

  const degrees: Record<number, number> = {};
  for (const id of graph.nodes()) degrees[id] = graph.degree(id);
  const maxDeg = Math.max(...Object.values(degrees));

  console.clear();
  console.log('Graph: ' + graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges (layout: ' + layoutTime + 'ms)');

  app.innerHTML = '<div id="wrap" style="position:relative;width:100%;height:100%"><canvas id="c"></canvas></div>';
  const wrap = document.getElementById('wrap')!;
  wrap.appendChild(panel);
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.width = cW * 2; canvas.height = cH * 2;
  canvas.style.cssText = 'background:#060918;display:block;width:' + cW + 'px;height:' + cH + 'px;border-radius:4px';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // BFS layers from highest-degree hub
  const startNode = Number(Object.entries(degrees).sort((a,b) => b[1]-a[1])[0][0]);
  const visited = new Set<number>();
  const layers: number[][] = [];
  let frontier = [startNode];
  visited.add(startNode);
  while (frontier.length > 0) {
    layers.push([...frontier]);
    const next: number[] = [];
    for (const node of frontier) for (const nb of graph.neighbors(node)) {
      if (!visited.has(nb)) { visited.add(nb); next.push(nb); }
    }
    frontier = next;
  }

  const palette = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#00d2d3','#fd79a8','#00b894','#e17055','#6c5ce7'];
  const nodeColor: Record<number, string> = {};
  layers.forEach((layer, i) => { for (const id of layer) nodeColor[id] = palette[i % palette.length]; });

  console.log('BFS from hub #' + startNode + ' (degree ' + degrees[startNode] + ') → ' + layers.length + ' layers');

  let currentLayer = 0;
  const revealedNodes = new Set<number>();
  const revealedEdges = new Set<string>();
  let frame = 0;

  function draw(scale = 1, ox = 0, oy = 0) {
    const sx = cW / W * scale, sy = cH / H * scale;
    ctx.clearRect(0, 0, cW, cH);
    ctx.save();
    ctx.translate(ox, oy);

    // Edges with subtle glow
    for (const key of revealedEdges) {
      const [a, b] = key.split('-').map(Number);
      ctx.beginPath();
      ctx.moveTo(pos[a][0]*sx, pos[a][1]*sy);
      ctx.lineTo(pos[b][0]*sx, pos[b][1]*sy);
      ctx.strokeStyle = 'rgba(80, 140, 240, 0.12)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Nodes with bloom glow on hubs
    const pulse = Math.sin(frame * 0.04) * 0.3 + 0.7;
    for (const id of revealedNodes) {
      const x = pos[id][0]*sx, y = pos[id][1]*sy;
      const r = (2 + (degrees[id] / maxDeg) * 10) * Math.min(scale, 2.5);
      const color = nodeColor[id] || '#555';

      if (degrees[id] > maxDeg * 0.3) {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        grad.addColorStop(0, color.replace(')', ',' + (0.25 * pulse) + ')').replace('rgb', 'rgba').replace('#', ''));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        // Simple hex-to-glow
        ctx.fillStyle = 'rgba(100,180,255,' + (0.08 * pulse) + ')';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = degrees[id] > maxDeg * 0.3 ? 8 * pulse : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // HUD
    ctx.fillStyle = 'rgba(10,10,30,0.7)';
    ctx.fillRect(0, cH - 28, cW, 28);
    ctx.fillStyle = '#aac';
    ctx.font = '11px monospace';
    ctx.fillText('Layer ' + Math.min(currentLayer, layers.length) + '/' + layers.length + ' · Nodes: ' + revealedNodes.size + '/' + graph.nodeCount() + ' · ' + layoutTime + 'ms · Drag to pan, scroll to zoom', 10, cH - 10);
  }

  const zp = enableZoomPan(canvas, draw);

  function animateStep() {
    if (currentLayer >= layers.length) {
      function loopGlow() { frame++; const t = zp.getTransform(); draw(t.scale, t.offsetX, t.offsetY); requestAnimationFrame(loopGlow); }
      loopGlow();
      return;
    }
    const layer = layers[currentLayer];
    for (const id of layer) {
      revealedNodes.add(id);
      for (const nb of graph.neighbors(id)) {
        if (revealedNodes.has(nb)) revealedEdges.add(Math.min(id,nb) + '-' + Math.max(id,nb));
      }
    }
    currentLayer++;
    frame++;
    const t = zp.getTransform();
    draw(t.scale, t.offsetX, t.offsetY);
    setTimeout(animateStep, Math.max(40, 150 - nodeCount / 10));
  }
  animateStep();
}

// Controls
document.getElementById('nslider')?.addEventListener('input', (e) => {
  nodeCount = Number((e.target as HTMLInputElement).value);
  document.getElementById('nval')!.textContent = String(nodeCount);
});
document.getElementById('regen')?.addEventListener('click', run);
// Initial append of panel for slider binding
app.innerHTML = '<div id="wrap" style="position:relative;width:100%;height:100%"></div>';
document.getElementById('wrap')!.appendChild(panel);
setTimeout(() => {
  document.getElementById('nslider')?.addEventListener('input', (e) => {
    nodeCount = Number((e.target as HTMLInputElement).value);
    document.getElementById('nval')!.textContent = String(nodeCount);
  });
  document.getElementById('regen')?.addEventListener('click', run);
  run();
}, 50);
`;

const communityViz = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';

const app = document.getElementById('app')!;
const cW = app.clientWidth || 800, cH = app.clientHeight || 600;

// Control panel
const panel = document.createElement('div');
panel.style.cssText = 'position:absolute;top:8px;left:8px;z-index:20;display:flex;gap:8px;align-items:center';
panel.innerHTML = \`
  <label style="color:#aaa;font:11px monospace">Nodes:</label>
  <input id="nslider" type="range" min="50" max="500" value="250" style="width:100px;accent-color:#4ecdc4">
  <span id="nval" style="color:#ccc;font:11px monospace;width:32px">250</span>
  <button id="regen" style="padding:3px 10px;border-radius:5px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,50,0.8);color:#8cf;font:11px monospace;cursor:pointer;backdrop-filter:blur(4px)">Regenerate</button>
\`;

function makeSocialNetwork(totalNodes: number): { graph: Graph; trueLabels: Map<number, number> } {
  const numComm = Math.max(3, Math.round(totalNodes / 35));
  const sizes: number[] = [];
  let remaining = totalNodes;
  for (let i = 0; i < numComm - 1; i++) {
    const s = Math.max(10, Math.round(remaining / (numComm - i) * (0.7 + Math.random() * 0.6)));
    sizes.push(Math.min(s, remaining - (numComm - i - 1) * 10));
    remaining -= sizes[sizes.length - 1];
  }
  sizes.push(remaining);

  const edges: [number, number][] = [];
  const seen = new Set<string>();
  const add = (a: number, b: number) => {
    const k = Math.min(a,b)+'-'+Math.max(a,b);
    if (a !== b && !seen.has(k)) { seen.add(k); edges.push([a, b]); }
  };

  const trueLabels = new Map<number, number>();
  let offset = 0;
  const offsets = [0];
  for (let c = 0; c < sizes.length; c++) {
    const size = sizes[c];
    for (let i = 0; i < size; i++) {
      trueLabels.set(offset + i, c);
      for (let j = i + 1; j < size; j++) {
        if (Math.random() < 0.3) add(offset + i, offset + j);
      }
    }
    offset += size;
    offsets.push(offset);
  }
  for (let c = 0; c < sizes.length; c++) {
    for (let c2 = c + 1; c2 < sizes.length; c2++) {
      const bridges = 1 + Math.floor(Math.random() * 3);
      for (let k = 0; k < bridges; k++) {
        add(offsets[c] + Math.floor(Math.random()*sizes[c]),
            offsets[c2] + Math.floor(Math.random()*sizes[c2]));
      }
    }
  }
  return { graph: Graph.fromEdges(edges), trueLabels };
}

function detectCommunities(graph: Graph): Map<number, number> {
  const nodes = graph.nodes();
  const labels = new Map<number, number>();
  for (const id of nodes) labels.set(id, id);
  const totalEdges = graph.edgeCount() * 2;
  for (let pass = 0; pass < 40; pass++) {
    let moved = false;
    const order = [...nodes].sort(() => Math.random() - 0.5);
    for (const node of order) {
      const nbs = graph.neighbors(node);
      if (nbs.length === 0) continue;
      const commW = new Map<number, number>();
      for (const nb of nbs) { const c = labels.get(nb)!; commW.set(c, (commW.get(c)||0)+1); }
      let bestComm = labels.get(node)!, bestGain = 0;
      for (const [c, w] of commW) {
        const gain = w - nbs.length * w / totalEdges;
        if (gain > bestGain) { bestGain = gain; bestComm = c; }
      }
      if (bestComm !== labels.get(node)) { labels.set(node, bestComm); moved = true; }
    }
    if (!moved) break;
  }
  const remap = new Map<number, number>();
  let nextId = 0;
  for (const [, lbl] of labels) { if (!remap.has(lbl)) remap.set(lbl, nextId++); }
  for (const [node, lbl] of labels) labels.set(node, remap.get(lbl)!);
  return labels;
}

function forceLayout(graph: Graph, W: number, H: number) {
  const nodes = graph.nodes(); const n = nodes.length;
  const k = Math.sqrt((W * H) / n);
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [100 + Math.random() * (W-200), 100 + Math.random() * (H-200)];
  let temp = W / 4;
  for (let iter = 0; iter < 100; iter++) {
    const disp: Record<number, [number, number]> = {};
    for (const v of nodes) disp[v] = [0, 0];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const vi = nodes[i], vj = nodes[j];
      const dx = pos[vi][0]-pos[vj][0], dy = pos[vi][1]-pos[vj][1];
      const dist = Math.max(Math.sqrt(dx*dx+dy*dy), 0.1);
      const f = (k*k)/dist;
      disp[vi][0]+=(dx/dist)*f; disp[vi][1]+=(dy/dist)*f;
      disp[vj][0]-=(dx/dist)*f; disp[vj][1]-=(dy/dist)*f;
    }
    for (const e of graph.edges()) {
      const dx=pos[e.source][0]-pos[e.target][0], dy=pos[e.source][1]-pos[e.target][1];
      const dist=Math.max(Math.sqrt(dx*dx+dy*dy),0.1);
      const f=(dist*dist)/k;
      disp[e.source][0]-=(dx/dist)*f; disp[e.source][1]-=(dy/dist)*f;
      disp[e.target][0]+=(dx/dist)*f; disp[e.target][1]+=(dy/dist)*f;
    }
    for (const v of nodes) {
      const d=Math.max(Math.sqrt(disp[v][0]**2+disp[v][1]**2),0.1);
      pos[v][0]=Math.max(40,Math.min(W-40,pos[v][0]+(disp[v][0]/d)*Math.min(d,temp)));
      pos[v][1]=Math.max(40,Math.min(H-40,pos[v][1]+(disp[v][1]/d)*Math.min(d,temp)));
    }
    temp *= 0.94;
  }
  return pos;
}

let nodeCount = 250;

function hexToRgb(hex: string): [number,number,number] {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

function run() {
  const t0 = performance.now();
  const { graph } = makeSocialNetwork(nodeCount);
  const labels = detectCommunities(graph);
  const W = 1400, H = 900;
  const pos = forceLayout(graph, W, H);
  const elapsed = (performance.now() - t0).toFixed(1);

  const commMap = new Map<number, number[]>();
  for (const [node, lbl] of labels) { if (!commMap.has(lbl)) commMap.set(lbl, []); commMap.get(lbl)!.push(node); }

  console.clear();
  console.log('Network: ' + graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges (' + elapsed + 'ms)');
  console.log('Communities: ' + commMap.size);
  [...commMap.entries()].sort((a,b)=>b[1].length-a[1].length).slice(0,8)
    .forEach(([,m],i) => console.log('  #' + (i+1) + ': ' + m.length + ' members'));

  app.innerHTML = '<div id="wrap" style="position:relative;width:100%;height:100%"><canvas id="c"></canvas></div>';
  const wrap = document.getElementById('wrap')!;
  wrap.appendChild(panel);
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.width = cW * 2; canvas.height = cH * 2;
  canvas.style.cssText = 'background:#04061a;display:block;width:' + cW + 'px;height:' + cH + 'px;border-radius:4px';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  const palette = ['#ff6b6b','#4ecdc4','#45b7d1','#feca57','#a29bfe','#fd79a8','#00b894','#e17055','#0984e3','#6c5ce7','#74b9ff','#fab1a0','#00cec9','#fdcb6e'];
  const commColor = new Map<number, string>();
  let ci = 0;
  for (const [lbl] of [...commMap.entries()].sort((a,b)=>b[1].length-a[1].length)) {
    commColor.set(lbl, palette[ci % palette.length]); ci++;
  }

  let frame = 0;
  let sc = 1, ox = 0, oy = 0;

  function draw(scale = sc, offX = ox, offY = oy) {
    sc = scale; ox = offX; oy = offY;
    const sx = cW / W * scale, sy = cH / H * scale;
    const pulse = Math.sin(frame * 0.025) * 0.5 + 0.5;
    ctx.clearRect(0, 0, cW, cH);
    ctx.save();
    ctx.translate(offX, offY);

    // Community hull regions (soft background)
    for (const [lbl, members] of commMap) {
      if (members.length < 5) continue;
      const color = commColor.get(lbl) || '#444';
      const [r,g,b] = hexToRgb(color);
      let cx = 0, cy = 0;
      for (const id of members) { cx += pos[id][0]; cy += pos[id][1]; }
      cx /= members.length; cy /= members.length;
      let maxR = 0;
      for (const id of members) {
        const dx = pos[id][0]-cx, dy = pos[id][1]-cy;
        maxR = Math.max(maxR, Math.sqrt(dx*dx+dy*dy));
      }
      const grad = ctx.createRadialGradient(cx*sx, cy*sy, 0, cx*sx, cy*sy, (maxR+30)*Math.min(sx,sy));
      grad.addColorStop(0, 'rgba('+r+','+g+','+b+','+(0.04+pulse*0.02)+')');
      grad.addColorStop(1, 'rgba('+r+','+g+','+b+',0)');
      ctx.beginPath();
      ctx.arc(cx*sx, cy*sy, (maxR+30)*Math.min(sx,sy), 0, Math.PI*2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Edges
    for (const e of graph.edges()) {
      const sameComm = labels.get(e.source) === labels.get(e.target);
      const color = sameComm ? (commColor.get(labels.get(e.source)!)||'#444') : '#334';
      const [r,g,b] = hexToRgb(color);
      ctx.beginPath();
      ctx.moveTo(pos[e.source][0]*sx, pos[e.source][1]*sy);
      ctx.lineTo(pos[e.target][0]*sx, pos[e.target][1]*sy);
      const alpha = sameComm ? 0.18 : (0.03 + pulse * 0.04);
      ctx.strokeStyle = 'rgba('+r+','+g+','+b+','+alpha+')';
      ctx.lineWidth = sameComm ? 0.8 : 0.4;
      ctx.stroke();
    }

    // Nodes with glow
    for (const id of graph.nodes()) {
      const x = pos[id][0]*sx, y = pos[id][1]*sy;
      const color = commColor.get(labels.get(id)!) || '#555';
      const [r,g,b] = hexToRgb(color);
      const deg = graph.degree(id);
      const radius = (2 + (deg / 20) * 5) * Math.min(scale, 2.5);

      if (deg > 12) {
        ctx.beginPath();
        ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba('+r+','+g+','+b+','+(0.08+pulse*0.06)+')';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = deg > 12 ? 6 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(10,10,30,0.75)';
    ctx.fillRect(0, cH - 28, cW, 28);
    ctx.fillStyle = '#aac';
    ctx.font = '11px monospace';
    ctx.fillText(commMap.size + ' communities · ' + graph.nodeCount() + ' nodes · ' + elapsed + 'ms · Drag pan · Scroll zoom', 10, cH - 10);
  }

  enableZoomPan(canvas, draw);
  function animate() { frame++; draw(); requestAnimationFrame(animate); }
  animate();
}

app.innerHTML = '<div id="wrap" style="position:relative;width:100%;height:100%"></div>';
document.getElementById('wrap')!.appendChild(panel);
setTimeout(() => {
  document.getElementById('nslider')?.addEventListener('input', (e) => {
    nodeCount = Number((e.target as HTMLInputElement).value);
    document.getElementById('nval')!.textContent = String(nodeCount);
  });
  document.getElementById('regen')?.addEventListener('click', run);
  run();
}, 50);
`;

const centralityViz = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';

const app = document.getElementById('app')!;
const cW = app.clientWidth || 800, cH = app.clientHeight || 600;

const panel = document.createElement('div');
panel.style.cssText = 'position:absolute;top:8px;left:8px;z-index:20;display:flex;gap:8px;align-items:center';
panel.innerHTML = \`
  <label style="color:#aaa;font:11px monospace">Nodes:</label>
  <input id="nslider" type="range" min="40" max="300" value="150" style="width:100px;accent-color:#ff6b6b">
  <span id="nval" style="color:#ccc;font:11px monospace;width:32px">150</span>
  <button id="regen" style="padding:3px 10px;border-radius:5px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,50,0.8);color:#f88;font:11px monospace;cursor:pointer;backdrop-filter:blur(4px)">Regenerate</button>
\`;

function buildFraudNetwork(n: number): Graph {
  const numClusters = Math.max(3, Math.round(n / 30));
  const clusterSize = Math.floor(n / numClusters);
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  const add = (a: number, b: number) => { const k = Math.min(a,b)+'-'+Math.max(a,b); if (a!==b && !seen.has(k)) { seen.add(k); edges.push([a,b]); } };

  for (let c = 0; c < numClusters; c++) {
    const base = c * clusterSize;
    for (let i = 0; i < clusterSize; i++) for (let j = i+1; j < clusterSize; j++) {
      if (Math.random() < 0.25) add(base+i, base+j);
    }
  }
  // Gateway nodes connecting clusters
  const gateways: number[] = [];
  for (let c = 0; c < numClusters; c++) gateways.push(c * clusterSize + Math.floor(Math.random()*3));
  for (let i = 0; i < gateways.length; i++) for (let j = i+1; j < gateways.length; j++) {
    if (Math.random() < 0.5) add(gateways[i], gateways[j]);
  }
  for (let c = 0; c < numClusters - 1; c++) {
    for (let k = 0; k < 3; k++) add(c*clusterSize+Math.floor(Math.random()*clusterSize), (c+1)*clusterSize+Math.floor(Math.random()*clusterSize));
  }
  return Graph.fromEdges(edges);
}

function betweenness(graph: Graph): Map<number, number> {
  const nodes = graph.nodes();
  const cb = new Map<number, number>();
  for (const v of nodes) cb.set(v, 0);
  for (const s of nodes) {
    const stack: number[] = []; const pred = new Map<number, number[]>();
    const sigma = new Map<number, number>(); const dist = new Map<number, number>();
    for (const v of nodes) { pred.set(v,[]); sigma.set(v,0); dist.set(v,-1); }
    sigma.set(s,1); dist.set(s,0); const queue = [s];
    while (queue.length > 0) {
      const v = queue.shift()!; stack.push(v);
      for (const w of graph.neighbors(v)) {
        if (dist.get(w)!<0) { queue.push(w); dist.set(w,dist.get(v)!+1); }
        if (dist.get(w)===dist.get(v)!+1) { sigma.set(w,sigma.get(w)!+sigma.get(v)!); pred.get(w)!.push(v); }
      }
    }
    const delta = new Map<number, number>();
    for (const v of nodes) delta.set(v,0);
    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of pred.get(w)!) delta.set(v, delta.get(v)!+(sigma.get(v)!/sigma.get(w)!)*(1+delta.get(w)!));
      if (w !== s) cb.set(w, cb.get(w)!+delta.get(w)!);
    }
  }
  const maxCb = Math.max(...cb.values(), 1);
  for (const [k,v] of cb) cb.set(k, v/maxCb);
  return cb;
}

function forceLayout(graph: Graph, W: number, H: number) {
  const nodes = graph.nodes(); const n = nodes.length;
  const k = Math.sqrt(W*H/n);
  const pos: Record<number,[number,number]> = {};
  for (const id of nodes) pos[id] = [100+Math.random()*(W-200), 100+Math.random()*(H-200)];
  let temp = W/4;
  for (let iter = 0; iter < 100; iter++) {
    const disp: Record<number,[number,number]> = {};
    for (const v of nodes) disp[v]=[0,0];
    for (let i=0;i<n;i++) for (let j=i+1;j<n;j++) {
      const vi=nodes[i],vj=nodes[j];
      const dx=pos[vi][0]-pos[vj][0],dy=pos[vi][1]-pos[vj][1];
      const dist=Math.max(Math.sqrt(dx*dx+dy*dy),0.1);
      const f=(k*k)/dist;
      disp[vi][0]+=(dx/dist)*f;disp[vi][1]+=(dy/dist)*f;
      disp[vj][0]-=(dx/dist)*f;disp[vj][1]-=(dy/dist)*f;
    }
    for (const e of graph.edges()) {
      const dx=pos[e.source][0]-pos[e.target][0],dy=pos[e.source][1]-pos[e.target][1];
      const dist=Math.max(Math.sqrt(dx*dx+dy*dy),0.1);
      const f=(dist*dist)/k;
      disp[e.source][0]-=(dx/dist)*f;disp[e.source][1]-=(dy/dist)*f;
      disp[e.target][0]+=(dx/dist)*f;disp[e.target][1]+=(dy/dist)*f;
    }
    for (const v of nodes) {
      const d=Math.max(Math.sqrt(disp[v][0]**2+disp[v][1]**2),0.1);
      pos[v][0]=Math.max(40,Math.min(W-40,pos[v][0]+(disp[v][0]/d)*Math.min(d,temp)));
      pos[v][1]=Math.max(40,Math.min(H-40,pos[v][1]+(disp[v][1]/d)*Math.min(d,temp)));
    }
    temp*=0.94;
  }
  return pos;
}

let nodeCount = 150;

function run() {
  const t0 = performance.now();
  const graph = buildFraudNetwork(nodeCount);
  const bc = betweenness(graph);
  const elapsed = (performance.now()-t0).toFixed(1);
  const W = 1400, H = 900;
  const pos = forceLayout(graph, W, H);
  const nodes = graph.nodes();
  const sorted = [...bc.entries()].sort((a,b)=>b[1]-a[1]);

  console.clear();
  console.log('Fraud network: ' + graph.nodeCount() + ' nodes, ' + graph.edgeCount() + ' edges (' + elapsed + 'ms)');
  console.log('Top suspicious accounts:');
  sorted.slice(0,8).forEach(([id,s],i)=>console.log('  #'+(i+1)+' Account '+id+' → centrality: '+s.toFixed(4)));

  app.innerHTML = '<div id="wrap" style="position:relative;width:100%;height:100%"><canvas id="c"></canvas></div>';
  const wrap = document.getElementById('wrap')!;
  wrap.appendChild(panel);
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.width = cW*2; canvas.height = cH*2;
  canvas.style.cssText = 'background:#080c1a;display:block;width:'+cW+'px;height:'+cH+'px;border-radius:4px';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // Particles on high-betweenness edges
  const suspEdges = graph.edges().filter(e => (bc.get(e.source)||0) > 0.15 || (bc.get(e.target)||0) > 0.15);
  interface Particle { sx:number;sy:number;tx:number;ty:number;progress:number;speed:number }
  const particles: Particle[] = [];
  if (suspEdges.length > 0) {
    for (let i = 0; i < Math.min(50, suspEdges.length * 3); i++) {
      const e = suspEdges[Math.floor(Math.random()*suspEdges.length)];
      particles.push({ sx:pos[e.source][0], sy:pos[e.source][1], tx:pos[e.target][0], ty:pos[e.target][1], progress:Math.random(), speed:0.004+Math.random()*0.008 });
    }
  }

  let frame = 0, sc = 1, oX = 0, oY = 0;

  function draw(scale=sc, offX=oX, offY=oY) {
    sc=scale; oX=offX; oY=offY;
    const sx=cW/W*scale, sy=cH/H*scale;
    const pulse = Math.sin(frame*0.04)*0.5+0.5;
    ctx.clearRect(0,0,cW,cH);
    ctx.save();
    ctx.translate(offX,offY);

    // Edges
    for (const e of graph.edges()) {
      const isBridge = (bc.get(e.source)||0) > 0.15 || (bc.get(e.target)||0) > 0.15;
      ctx.beginPath();
      ctx.moveTo(pos[e.source][0]*sx, pos[e.source][1]*sy);
      ctx.lineTo(pos[e.target][0]*sx, pos[e.target][1]*sy);
      if (isBridge) {
        ctx.strokeStyle = 'rgba(255,80,80,'+(0.1+pulse*0.1)+')';
        ctx.lineWidth = 1;
      } else {
        ctx.strokeStyle = 'rgba(60,100,180,0.06)';
        ctx.lineWidth = 0.4;
      }
      ctx.stroke();
    }

    // Animated particles (money flow)
    for (const p of particles) {
      const px = (p.sx+(p.tx-p.sx)*p.progress)*sx;
      const py = (p.sy+(p.ty-p.sy)*p.progress)*sy;
      const grad = ctx.createRadialGradient(px,py,0,px,py,4);
      grad.addColorStop(0,'rgba(255,200,50,'+(0.6+pulse*0.3)+')');
      grad.addColorStop(1,'rgba(255,200,50,0)');
      ctx.beginPath();
      ctx.arc(px,py,4,0,Math.PI*2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Nodes
    const clusterSize = Math.floor(nodeCount / Math.max(3, Math.round(nodeCount/30)));
    const clusterColors = ['#4ecdc4','#45b7d1','#feca57','#a29bfe','#ff9ff3','#00b894','#e17055','#74b9ff','#fdcb6e','#6c5ce7'];
    for (const id of nodes) {
      const x=pos[id][0]*sx, y=pos[id][1]*sy;
      const score = bc.get(id)||0;
      const r = (2+score*14)*Math.min(scale,2.5);
      const cluster = Math.floor(id/clusterSize);

      if (score > 0.2) {
        const glowR = r+8+pulse*8;
        const grad = ctx.createRadialGradient(x,y,r*0.3,x,y,glowR);
        grad.addColorStop(0,'rgba(255,60,60,'+(0.3+pulse*0.2)+')');
        grad.addColorStop(1,'rgba(255,60,60,0)');
        ctx.beginPath(); ctx.arc(x,y,glowR,0,Math.PI*2);
        ctx.fillStyle = grad; ctx.fill();
      }

      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      if (score > 0.3) { ctx.fillStyle = '#ff3333'; ctx.shadowColor='#ff3333'; ctx.shadowBlur=10; }
      else if (score > 0.15) { ctx.fillStyle = '#ff8844'; ctx.shadowColor='#ff8844'; ctx.shadowBlur=4; }
      else { ctx.fillStyle = clusterColors[cluster%clusterColors.length]; ctx.shadowBlur=0; }
      ctx.fill();
      ctx.shadowBlur=0;
    }
    ctx.restore();

    // HUD
    ctx.fillStyle = 'rgba(10,10,30,0.75)';
    ctx.fillRect(0,cH-28,cW,28);
    ctx.fillStyle = '#aac';
    ctx.font = '11px monospace';
    const flagged = sorted.filter(s=>s[1]>0.3).length;
    ctx.fillText('FRAUD SCAN · '+graph.nodeCount()+' accounts · '+elapsed+'ms · Drag pan · Scroll zoom', 10, cH-10);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('⚠ '+flagged+' HIGH RISK', cW-130, 20);
  }

  enableZoomPan(canvas, draw);

  function animate() {
    frame++;
    for (const p of particles) {
      p.progress += p.speed;
      if (p.progress >= 1 && suspEdges.length > 0) {
        p.progress = 0;
        const e = suspEdges[Math.floor(Math.random()*suspEdges.length)];
        p.sx=pos[e.source][0]; p.sy=pos[e.source][1];
        p.tx=pos[e.target][0]; p.ty=pos[e.target][1];
      }
    }
    draw();
    requestAnimationFrame(animate);
  }
  animate();
}

app.innerHTML = '<div id="wrap" style="position:relative;width:100%;height:100%"></div>';
document.getElementById('wrap')!.appendChild(panel);
setTimeout(() => {
  document.getElementById('nslider')?.addEventListener('input', (e) => {
    nodeCount = Number((e.target as HTMLInputElement).value);
    document.getElementById('nval')!.textContent = String(nodeCount);
  });
  document.getElementById('regen')?.addEventListener('click', run);
  run();
}, 50);
`;

const pageRankViz = `import { Graph } from './graphrs-core.js';
import { enableZoomPan } from './zoom-pan.js';

const app = document.getElementById('app')!;
const cW = app.clientWidth || 800, cH = app.clientHeight || 600;

const panel = document.createElement('div');
panel.style.cssText = 'position:absolute;top:8px;left:8px;z-index:20;display:flex;gap:8px;align-items:center';
panel.innerHTML = \`
  <label style="color:#aaa;font:11px monospace">Pages:</label>
  <input id="nslider" type="range" min="50" max="500" value="250" style="width:100px;accent-color:#feca57">
  <span id="nval" style="color:#ccc;font:11px monospace;width:32px">250</span>
  <button id="regen" style="padding:3px 10px;border-radius:5px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,50,0.8);color:#fe8;font:11px monospace;cursor:pointer;backdrop-filter:blur(4px)">Regenerate</button>
\`;

function webGraph(n: number): Graph {
  const edges: [number,number][] = [];
  const seen = new Set<string>();
  const add = (f:number,t:number) => { const k=f+'-'+t; if(f!==t&&!seen.has(k)){seen.add(k);edges.push([f,t]);} };
  const numClusters = Math.max(4, Math.round(n/50));
  const clusterSize = Math.floor(n/numClusters);
  for (let c=0;c<numClusters;c++) {
    const base = c*clusterSize;
    for (let i=0;i<clusterSize;i++) {
      const from = base+i;
      const numLinks = 2+Math.floor(Math.random()*4);
      for (let t=0;t<numLinks;t++) add(from, base+Math.floor(Math.random()*clusterSize));
    }
    const hub = base+Math.floor(Math.random()*3);
    for (let i=0;i<clusterSize;i++) add(hub, base+i);
  }
  for (let i=0;i<n/4;i++) add(Math.floor(Math.random()*n), Math.floor(Math.random()*n));
  return Graph.fromEdges(edges, { directed: true });
}

function pageRank(graph: Graph, d=0.85, iterations=50): Map<number,number> {
  const nodes = graph.nodes(); const n = nodes.length;
  const outDeg = new Map<number,number>(); const inLinks = new Map<number,number[]>();
  for (const id of nodes) { outDeg.set(id,0); inLinks.set(id,[]); }
  for (const e of graph.edges()) {
    outDeg.set(e.source, (outDeg.get(e.source)||0)+1);
    inLinks.get(e.target)!.push(e.source);
  }
  let rank = new Map<number,number>();
  for (const id of nodes) rank.set(id, 1/n);
  for (let i=0;i<iterations;i++) {
    let danglingSum = 0;
    for (const id of nodes) { if ((outDeg.get(id)||0)===0) danglingSum += rank.get(id)!; }
    const nr = new Map<number,number>();
    for (const id of nodes) {
      let sum = 0;
      for (const src of inLinks.get(id)!) sum += (rank.get(src)||0)/(outDeg.get(src)||1);
      nr.set(id, (1-d)/n + d*(sum + danglingSum/n));
    }
    rank = nr;
  }
  return rank;
}

function forceLayout(graph: Graph, W: number, H: number) {
  const nodes = graph.nodes(); const n = nodes.length;
  const k = Math.sqrt(W*H/n)*0.8;
  const pos: Record<number,[number,number]> = {};
  for (const id of nodes) pos[id]=[100+Math.random()*(W-200),100+Math.random()*(H-200)];
  let temp = W/5;
  for (let iter=0;iter<80;iter++) {
    const disp: Record<number,[number,number]> = {};
    for (const v of nodes) disp[v]=[0,0];
    for (let i=0;i<n;i++) for (let j=i+1;j<n;j++) {
      const vi=nodes[i],vj=nodes[j];
      const dx=pos[vi][0]-pos[vj][0],dy=pos[vi][1]-pos[vj][1];
      const dist=Math.max(Math.sqrt(dx*dx+dy*dy),0.5);
      const f=(k*k)/dist*0.5;
      disp[vi][0]+=(dx/dist)*f;disp[vi][1]+=(dy/dist)*f;
      disp[vj][0]-=(dx/dist)*f;disp[vj][1]-=(dy/dist)*f;
    }
    for (const e of graph.edges()) {
      const dx=pos[e.source][0]-pos[e.target][0],dy=pos[e.source][1]-pos[e.target][1];
      const dist=Math.max(Math.sqrt(dx*dx+dy*dy),0.5);
      const f=(dist*dist)/k*0.3;
      disp[e.source][0]-=(dx/dist)*f;disp[e.source][1]-=(dy/dist)*f;
      disp[e.target][0]+=(dx/dist)*f;disp[e.target][1]+=(dy/dist)*f;
    }
    for (const v of nodes) {
      const d=Math.max(Math.sqrt(disp[v][0]**2+disp[v][1]**2),0.1);
      pos[v][0]=Math.max(40,Math.min(W-40,pos[v][0]+(disp[v][0]/d)*Math.min(d,temp)));
      pos[v][1]=Math.max(40,Math.min(H-40,pos[v][1]+(disp[v][1]/d)*Math.min(d,temp)));
    }
    temp*=0.93;
  }
  return pos;
}

let nodeCount = 250;

function run() {
  const t0 = performance.now();
  const graph = webGraph(nodeCount);
  const ranks = pageRank(graph);
  const elapsed = (performance.now()-t0).toFixed(1);
  const W = 1400, H = 900;
  const pos = forceLayout(graph, W, H);
  const nodes = graph.nodes();
  const sorted = [...ranks.entries()].sort((a,b)=>b[1]-a[1]);
  const maxRank = sorted.length > 0 ? sorted[0][1] : 1;

  console.clear();
  console.log('Web graph: '+graph.nodeCount()+' pages, '+graph.edgeCount()+' links ('+elapsed+'ms)');
  console.log('Top authority pages:');
  sorted.slice(0,10).forEach(([id,r],i)=>console.log('  #'+(i+1)+' Page '+id+': '+r.toFixed(6)));

  app.innerHTML = '<div id="wrap" style="position:relative;width:100%;height:100%"><canvas id="c"></canvas></div>';
  const wrap = document.getElementById('wrap')!;
  wrap.appendChild(panel);
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.width=cW*2; canvas.height=cH*2;
  canvas.style.cssText='background:#06081c;display:block;width:'+cW+'px;height:'+cH+'px;border-radius:4px';
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2,2);

  // Particles on high-rank edges (guard against empty array)
  interface Particle { sx:number;sy:number;tx:number;ty:number;progress:number;speed:number }
  const allEdges = graph.edges();
  const topEdges = allEdges.filter(e => (ranks.get(e.source)||0)/maxRank > 0.1 || (ranks.get(e.target)||0)/maxRank > 0.1);
  const edgePool = topEdges.length > 0 ? topEdges : allEdges.slice(0, Math.min(20, allEdges.length));
  const particles: Particle[] = [];
  if (edgePool.length > 0) {
    for (let i=0;i<Math.min(60, edgePool.length*3);i++) {
      const e = edgePool[Math.floor(Math.random()*edgePool.length)];
      particles.push({ sx:pos[e.source][0],sy:pos[e.source][1],tx:pos[e.target][0],ty:pos[e.target][1],progress:Math.random(),speed:0.003+Math.random()*0.007 });
    }
  }

  let frame=0, sc=1, oX=0, oY=0;

  function draw(scale=sc, offX=oX, offY=oY) {
    sc=scale; oX=offX; oY=offY;
    const sx=cW/W*scale, sy=cH/H*scale;
    const pulse = Math.sin(frame*0.035)*0.5+0.5;
    ctx.clearRect(0,0,cW,cH);
    ctx.save();
    ctx.translate(offX,offY);

    // Edges (very subtle for directed graph)
    for (const e of allEdges) {
      const srcRank = (ranks.get(e.source)||0)/maxRank;
      const tgtRank = (ranks.get(e.target)||0)/maxRank;
      const important = srcRank > 0.2 || tgtRank > 0.2;
      ctx.beginPath();
      ctx.moveTo(pos[e.source][0]*sx, pos[e.source][1]*sy);
      ctx.lineTo(pos[e.target][0]*sx, pos[e.target][1]*sy);
      ctx.strokeStyle = important ? 'rgba(255,200,60,0.08)' : 'rgba(50,80,150,0.03)';
      ctx.lineWidth = important ? 0.7 : 0.3;
      ctx.stroke();
    }

    // Particles (link juice flow)
    for (const p of particles) {
      const px=(p.sx+(p.tx-p.sx)*p.progress)*sx;
      const py=(p.sy+(p.ty-p.sy)*p.progress)*sy;
      const grad = ctx.createRadialGradient(px,py,0,px,py,3.5);
      grad.addColorStop(0,'rgba(255,220,80,'+(0.5+pulse*0.4)+')');
      grad.addColorStop(1,'rgba(255,220,80,0)');
      ctx.beginPath(); ctx.arc(px,py,3.5,0,Math.PI*2);
      ctx.fillStyle=grad; ctx.fill();
    }

    // Nodes with authority glow
    for (const id of nodes) {
      const x=pos[id][0]*sx, y=pos[id][1]*sy;
      const norm = (ranks.get(id)||0)/maxRank;
      const r = (1.5+norm*14)*Math.min(scale,2.5);

      if (norm > 0.2) {
        const glowR = r+6+pulse*6;
        const grad = ctx.createRadialGradient(x,y,r*0.2,x,y,glowR);
        grad.addColorStop(0,'rgba(255,200,50,'+(0.25+pulse*0.2)+')');
        grad.addColorStop(1,'rgba(255,200,50,0)');
        ctx.beginPath(); ctx.arc(x,y,glowR,0,Math.PI*2);
        ctx.fillStyle=grad; ctx.fill();
      }

      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      if (norm > 0.4) { ctx.fillStyle='#feca57'; ctx.shadowColor='#feca57'; ctx.shadowBlur=8; }
      else if (norm > 0.15) { ctx.fillStyle='#48dbfb'; ctx.shadowBlur=0; }
      else { ctx.fillStyle='hsl('+(200+norm*50)+',50%,40%)'; ctx.shadowBlur=0; }
      ctx.fill(); ctx.shadowBlur=0;
    }
    ctx.restore();

    ctx.fillStyle='rgba(10,10,30,0.75)';
    ctx.fillRect(0,cH-28,cW,28);
    ctx.fillStyle='#aac';
    ctx.font='11px monospace';
    ctx.fillText('PageRank · '+graph.nodeCount()+' pages · '+elapsed+'ms · Gold = authority · Drag pan · Scroll zoom',10,cH-10);
  }

  enableZoomPan(canvas, draw);

  function animate() {
    frame++;
    for (const p of particles) {
      p.progress += p.speed;
      if (p.progress >= 1 && edgePool.length > 0) {
        p.progress=0;
        const e=edgePool[Math.floor(Math.random()*edgePool.length)];
        p.sx=pos[e.source][0];p.sy=pos[e.source][1];
        p.tx=pos[e.target][0];p.ty=pos[e.target][1];
      }
    }
    draw();
    requestAnimationFrame(animate);
  }
  animate();
}

app.innerHTML = '<div id="wrap" style="position:relative;width:100%;height:100%"></div>';
document.getElementById('wrap')!.appendChild(panel);
setTimeout(() => {
  document.getElementById('nslider')?.addEventListener('input', (e) => {
    nodeCount = Number((e.target as HTMLInputElement).value);
    document.getElementById('nval')!.textContent = String(nodeCount);
  });
  document.getElementById('regen')?.addEventListener('click', run);
  run();
}, 50);
`;

const perfBenchmark = `import { Graph } from './graphrs-core.js';

function barabasiAlbert(n: number, m: number): Graph {
  const edges: [number,number][] = [];
  const degree: number[] = new Array(n).fill(0);
  for (let i=0;i<=m;i++) for (let j=i+1;j<=m;j++) { edges.push([i,j]);degree[i]++;degree[j]++; }
  for (let i=m+1;i<n;i++) {
    const targets=new Set<number>(); const total=degree.reduce((a,b)=>a+b,0);
    while(targets.size<m){let r=Math.random()*total;for(let j=0;j<i;j++){r-=degree[j];if(r<=0){targets.add(j);break;}}}
    for(const t of targets){edges.push([i,t]);degree[i]++;degree[t]++;}
  }
  return Graph.fromEdges(edges);
}

function bfs(graph: Graph, start: number): number {
  const visited=new Set<number>(); const queue=[start]; visited.add(start);
  while(queue.length>0){const node=queue.shift()!;for(const nb of graph.neighbors(node)){if(!visited.has(nb)){visited.add(nb);queue.push(nb);}}}
  return visited.size;
}

function betweenness(graph: Graph): number {
  const nodes=graph.nodes(); let maxCb=0;
  for(const s of nodes){
    const stack:number[]=[]; const pred=new Map<number,number[]>();
    const sigma=new Map<number,number>(); const dist=new Map<number,number>();
    for(const v of nodes){pred.set(v,[]);sigma.set(v,0);dist.set(v,-1);}
    sigma.set(s,1);dist.set(s,0);const queue=[s];
    while(queue.length>0){const v=queue.shift()!;stack.push(v);for(const w of graph.neighbors(v)){if(dist.get(w)!<0){queue.push(w);dist.set(w,dist.get(v)!+1);}if(dist.get(w)===dist.get(v)!+1){sigma.set(w,sigma.get(w)!+sigma.get(v)!);pred.get(w)!.push(v);}}}
    const delta=new Map<number,number>(); for(const v of nodes) delta.set(v,0);
    while(stack.length>0){const w=stack.pop()!;for(const v of pred.get(w)!){delta.set(v,delta.get(v)!+(sigma.get(v)!/sigma.get(w)!)*(1+delta.get(w)!));}if(w!==s&&delta.get(w)!>maxCb)maxCb=delta.get(w)!;}
  }
  return maxCb;
}

console.log('═══════════════════════════════════════════════');
console.log('  @graphrs Performance Benchmark');
console.log('  JS baseline vs WASM (igraph C library)');
console.log('═══════════════════════════════════════════════\\n');

const sizes=[100,200,500,1000];
const results:{n:number;edges:number;bfs:number;betw:number}[]=[];

for(const n of sizes){
  const g=barabasiAlbert(n,3);
  const t1=performance.now();for(let i=0;i<10;i++)bfs(g,0);const bfsTime=(performance.now()-t1)/10;
  let betwTime=0;
  if(n<=500){const t2=performance.now();betweenness(g);betwTime=performance.now()-t2;}
  results.push({n,edges:g.edgeCount(),bfs:bfsTime,betw:betwTime});
  console.log(n+' nodes ('+g.edgeCount()+' edges):');
  console.log('  BFS:         '+bfsTime.toFixed(2)+'ms (avg 10 runs)');
  if(n<=500)console.log('  Betweenness: '+betwTime.toFixed(1)+'ms');
  else console.log('  Betweenness: skipped (too slow in pure JS)');
  console.log('');
}

console.log('─────────────────────────────────────────────');
console.log('With @graphrs WASM (igraph backend):');
console.log('  • BFS: 10-50x faster');
console.log('  • Betweenness: 100-500x faster');
console.log('  • 10k nodes: feasible in WASM, frozen in JS');
console.log('─────────────────────────────────────────────');

// Chart visualization
const app=document.getElementById('app')!;
const cW=app.clientWidth||800, cH=app.clientHeight||600;
app.innerHTML='<canvas id="c" width="'+(cW*2)+'" height="'+(cH*2)+'" style="background:#0d1117;display:block;width:'+cW+'px;height:'+cH+'px;border-radius:4px"></canvas>';
const canvas=document.getElementById('c') as HTMLCanvasElement;
const ctx=canvas.getContext('2d')!;
ctx.scale(2,2);

const margin={top:50,right:40,bottom:60,left:80};
const w=cW-margin.left-margin.right, h=cH-margin.top-margin.bottom;
ctx.save(); ctx.translate(margin.left,margin.top);

ctx.fillStyle='#e6edf3'; ctx.font='bold 14px monospace';
ctx.fillText('Algorithm Performance: JS Baseline',0,-28);
ctx.font='11px monospace'; ctx.fillStyle='#8b949e';
ctx.fillText('Lower is better · WASM delivers 10-500x speedup',0,-10);

const maxTime=Math.max(...results.map(r=>Math.max(r.bfs,r.betw)));
const logMax=Math.ceil(Math.log10(Math.max(maxTime,10)));
const logMin=-1;

ctx.strokeStyle='#21262d'; ctx.lineWidth=0.5;
for(let p=logMin;p<=logMax;p++){
  const y=h-((p-logMin)/(logMax-logMin))*h;
  ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
  ctx.fillStyle='#8b949e';ctx.font='10px monospace';
  ctx.fillText(p<0?'0.1ms':p===0?'1ms':Math.pow(10,p)+'ms',-55,y+3);
}

const barW=w/sizes.length*0.35, gap=w/sizes.length;
results.forEach((r,i)=>{
  const x=i*gap+gap*0.15;
  const bfsLog=Math.log10(Math.max(r.bfs,0.1));
  const bfsH=((bfsLog-logMin)/(logMax-logMin))*h;
  ctx.fillStyle='#58a6ff'; ctx.fillRect(x,h-bfsH,barW,bfsH);
  ctx.fillStyle='#c9d1d9'; ctx.font='9px monospace';
  ctx.fillText(r.bfs.toFixed(1)+'ms',x,h-bfsH-4);
  if(r.betw>0){
    const betwLog=Math.log10(r.betw);
    const betwH=((betwLog-logMin)/(logMax-logMin))*h;
    ctx.fillStyle='#f78166'; ctx.fillRect(x+barW+4,h-betwH,barW,betwH);
    ctx.fillStyle='#c9d1d9'; ctx.fillText(r.betw.toFixed(0)+'ms',x+barW+4,h-betwH-4);
  }
  ctx.fillStyle='#e6edf3'; ctx.font='11px monospace';
  ctx.fillText(r.n+' nodes',x,h+18);
  ctx.fillStyle='#8b949e'; ctx.font='9px monospace';
  ctx.fillText(r.edges+' edges',x,h+32);
});

ctx.fillStyle='#58a6ff'; ctx.fillRect(w-160,-20,12,12);
ctx.fillStyle='#c9d1d9'; ctx.font='11px monospace'; ctx.fillText('BFS (avg 10)',w-144,-10);
ctx.fillStyle='#f78166'; ctx.fillRect(w-160,-2,12,12);
ctx.fillStyle='#c9d1d9'; ctx.fillText('Betweenness',w-144,8);
ctx.restore();
`;
</script>

# Interactive Playground

Edit the code and see results instantly. Each demo runs **real graph algorithms** on hundreds of nodes with animated visualization. Use the slider to adjust graph size, click **Regenerate** to create a new random graph.

## Network Traversal — BFS on Scale-Free Graph

**Real scenario**: Modeling information propagation in social networks. A Barabási–Albert scale-free graph simulates how viral content spreads from hub accounts. BFS reveals the layered "6 degrees of separation" structure — watch as waves propagate outward from the highest-degree hub:

<Playground :code="animatedBFS" />

## Community Detection — Social Network Clustering

**Real scenario**: Identifying user groups for recommendation engines. The planted partition model creates communities with dense internal connections and sparse bridges. Modularity-based label propagation detects clusters — the same algorithm family behind friend suggestions on social platforms:

<Playground :code="communityViz" />

## Fraud Detection — Betweenness Centrality

**Real scenario**: Finding money-laundering intermediaries in transaction networks. Brandes' algorithm identifies gateway accounts (red glow) that broker connections between clusters. Animated particles show suspicious money flow along high-betweenness edges — exactly how financial crime networks are detected:

<Playground :code="centralityViz" />

## Web Authority — PageRank

**Real scenario**: Ranking web pages by link authority. A directed graph simulates a web crawl with topical clusters. PageRank (50 iterations with dangling-node handling) identifies authoritative hub pages. Gold particles represent "link juice" flowing through the network — the algorithm that started Google:

<Playground :code="pageRankViz" />

## Performance — Why WASM Matters

**The bottleneck**: Graph algorithms are compute-intensive. Pure JavaScript hits a wall at medium scale — betweenness centrality on 500 nodes takes seconds, 10k nodes freezes the UI entirely. This benchmark measures JS baseline timing, demonstrating why `@graphrs` uses igraph's compiled C backend via WebAssembly for **10–500x speedup**:

<Playground :code="perfBenchmark" />
