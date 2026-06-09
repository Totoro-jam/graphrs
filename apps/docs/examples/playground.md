<script setup>
const largeBFS = `import { Graph } from '@graphrs/core';

// Generate a large random graph (200 nodes, ~600 edges)
function generateLargeGraph(nodeCount: number, avgDegree: number) {
  const edges: [number, number][] = [];
  const edgeCount = Math.floor(nodeCount * avgDegree / 2);
  const seen = new Set<string>();
  for (let i = 0; i < edgeCount; i++) {
    let a: number, b: number;
    do {
      a = Math.floor(Math.random() * nodeCount);
      b = Math.floor(Math.random() * nodeCount);
    } while (a === b || seen.has(a + '-' + b));
    seen.add(a + '-' + b);
    seen.add(b + '-' + a);
    edges.push([a, b]);
  }
  return Graph.fromEdges(edges);
}

// BFS traversal implementation
function bfs(graph: Graph, start: number): { visited: number[], layers: number[][] } {
  const visited: number[] = [];
  const layers: number[][] = [];
  const seen = new Set<number>([start]);
  let frontier = [start];
  while (frontier.length > 0) {
    layers.push([...frontier]);
    visited.push(...frontier);
    const next: number[] = [];
    for (const node of frontier) {
      for (const neighbor of graph.neighbors(node)) {
        if (!seen.has(neighbor)) {
          seen.add(neighbor);
          next.push(neighbor);
        }
      }
    }
    frontier = next;
  }
  return { visited, layers };
}

console.time('Graph generation');
const graph = generateLargeGraph(200, 6);
console.timeEnd('Graph generation');
console.log('Nodes:', graph.nodeCount(), '| Edges:', graph.edgeCount());

console.time('BFS traversal');
const { visited, layers } = bfs(graph, 0);
console.timeEnd('BFS traversal');
console.log('BFS reached', visited.length, 'nodes in', layers.length, 'layers');
console.log('Layer sizes:', layers.map(l => l.length).join(' → '));

// Connected component analysis
function connectedComponents(graph: Graph): number[][] {
  const allNodes = graph.nodes();
  const visited = new Set<number>();
  const components: number[][] = [];
  for (const start of allNodes) {
    if (visited.has(start)) continue;
    const comp: number[] = [];
    const queue = [start];
    visited.add(start);
    while (queue.length > 0) {
      const node = queue.shift()!;
      comp.push(node);
      for (const nb of graph.neighbors(node)) {
        if (!visited.has(nb)) {
          visited.add(nb);
          queue.push(nb);
        }
      }
    }
    components.push(comp);
  }
  return components;
}

console.time('Connected components');
const components = connectedComponents(graph);
console.timeEnd('Connected components');
console.log('\\nComponents:', components.length);
components.slice(0, 5).forEach((c, i) =>
  console.log('  Component', i + 1 + ':', c.length, 'nodes')
);
`;

const canvasViz = `import { Graph } from '@graphrs/core';

// Generate a scale-free graph (Barabási–Albert model)
function barabasiAlbert(n: number, m: number): Graph {
  const edges: [number, number][] = [];
  const degree: number[] = new Array(n).fill(0);
  // Start with a complete graph of m+1 nodes
  for (let i = 0; i <= m; i++) {
    for (let j = i + 1; j <= m; j++) {
      edges.push([i, j]);
      degree[i]++;
      degree[j]++;
    }
  }
  // Preferential attachment
  for (let i = m + 1; i < n; i++) {
    const targets = new Set<number>();
    const totalDeg = degree.reduce((a, b) => a + b, 0);
    while (targets.size < m) {
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
  return Graph.fromEdges(edges);
}

// Force-directed layout (Fruchterman-Reingold)
function forceLayout(graph: Graph, iterations = 80) {
  const nodes = graph.nodes();
  const n = nodes.length;
  const W = 580, H = 380;
  const area = W * H;
  const k = Math.sqrt(area / n);
  const pos: Record<number, [number, number]> = {};
  // Random initial positions
  for (const id of nodes) {
    pos[id] = [Math.random() * W, Math.random() * H];
  }
  let temp = W / 5;
  for (let iter = 0; iter < iterations; iter++) {
    const disp: Record<number, [number, number]> = {};
    for (const v of nodes) disp[v] = [0, 0];
    // Repulsive forces
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const vi = nodes[i], vj = nodes[j];
        const dx = pos[vi][0] - pos[vj][0];
        const dy = pos[vi][1] - pos[vj][1];
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
        const force = (k * k) / dist;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        disp[vi][0] += fx; disp[vi][1] += fy;
        disp[vj][0] -= fx; disp[vj][1] -= fy;
      }
    }
    // Attractive forces
    for (const e of graph.edges()) {
      const dx = pos[e.source][0] - pos[e.target][0];
      const dy = pos[e.source][1] - pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
      const force = (dist * dist) / k;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      disp[e.source][0] -= fx; disp[e.source][1] -= fy;
      disp[e.target][0] += fx; disp[e.target][1] += fy;
    }
    // Apply with temperature
    for (const v of nodes) {
      const dx = disp[v][0], dy = disp[v][1];
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
      const cap = Math.min(dist, temp);
      pos[v][0] += (dx / dist) * cap;
      pos[v][1] += (dy / dist) * cap;
      pos[v][0] = Math.max(20, Math.min(W - 20, pos[v][0]));
      pos[v][1] = Math.max(20, Math.min(H - 20, pos[v][1]));
    }
    temp *= 0.95;
  }
  return pos;
}

console.time('Generate BA graph (150 nodes)');
const graph = barabasiAlbert(150, 3);
console.timeEnd('Generate BA graph (150 nodes)');
console.log('Nodes:', graph.nodeCount(), '| Edges:', graph.edgeCount());

console.time('Force-directed layout');
const pos = forceLayout(graph);
console.timeEnd('Force-directed layout');

// Compute degree for node sizing
const degrees: Record<number, number> = {};
for (const id of graph.nodes()) degrees[id] = graph.degree(id);
const maxDeg = Math.max(...Object.values(degrees));

// Render to canvas
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="600" height="400" style="background:#1a1a2e;border-radius:8px;display:block;margin:0 auto"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Draw edges
ctx.strokeStyle = 'rgba(100,160,255,0.15)';
ctx.lineWidth = 0.8;
for (const e of graph.edges()) {
  ctx.beginPath();
  ctx.moveTo(pos[e.source][0] + 10, pos[e.source][1] + 10);
  ctx.lineTo(pos[e.target][0] + 10, pos[e.target][1] + 10);
  ctx.stroke();
}

// Draw nodes (size = degree)
for (const id of graph.nodes()) {
  const [x, y] = pos[id];
  const r = 2 + (degrees[id] / maxDeg) * 8;
  const hue = 200 + (degrees[id] / maxDeg) * 60;
  ctx.beginPath();
  ctx.arc(x + 10, y + 10, r, 0, Math.PI * 2);
  ctx.fillStyle = \`hsl(\${hue}, 80%, \${50 + (degrees[id]/maxDeg)*20}%)\`;
  ctx.fill();
}

// Hub analysis
const sorted = Object.entries(degrees).sort((a, b) => b[1] - a[1]);
console.log('\\nTop 5 hubs (degree):');
sorted.slice(0, 5).forEach(([id, deg]) => console.log('  Node', id + ':', deg, 'connections'));
`;

const pageRankViz = `import { Graph } from '@graphrs/core';

// Generate a web-like directed graph (300 nodes)
function generateWebGraph(n: number): Graph {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  // Create backbone clusters
  for (let cluster = 0; cluster < 5; cluster++) {
    const base = cluster * (n / 5);
    const size = Math.floor(n / 5);
    for (let i = 0; i < size; i++) {
      const from = Math.floor(base + i);
      const targets = 2 + Math.floor(Math.random() * 3);
      for (let t = 0; t < targets; t++) {
        const to = Math.floor(base + Math.random() * size);
        if (from !== to && !seen.has(from + '-' + to)) {
          seen.add(from + '-' + to);
          edges.push([from, to]);
        }
      }
    }
  }
  // Add cross-cluster links (fewer)
  for (let i = 0; i < n / 10; i++) {
    const from = Math.floor(Math.random() * n);
    const to = Math.floor(Math.random() * n);
    if (from !== to && !seen.has(from + '-' + to)) {
      seen.add(from + '-' + to);
      edges.push([from, to]);
    }
  }
  return Graph.fromEdges(edges, { directed: true });
}

// PageRank implementation (power iteration)
function pageRank(graph: Graph, damping = 0.85, iterations = 30): Map<number, number> {
  const nodes = graph.nodes();
  const n = nodes.length;
  const outDeg: Map<number, number> = new Map();
  const inLinks: Map<number, number[]> = new Map();
  for (const id of nodes) {
    outDeg.set(id, 0);
    inLinks.set(id, []);
  }
  for (const e of graph.edges()) {
    outDeg.set(e.source, (outDeg.get(e.source) || 0) + 1);
    inLinks.get(e.target)!.push(e.source);
  }
  let rank = new Map<number, number>();
  for (const id of nodes) rank.set(id, 1 / n);
  for (let iter = 0; iter < iterations; iter++) {
    const newRank = new Map<number, number>();
    for (const id of nodes) {
      let sum = 0;
      for (const src of inLinks.get(id)!) {
        sum += (rank.get(src) || 0) / (outDeg.get(src) || 1);
      }
      newRank.set(id, (1 - damping) / n + damping * sum);
    }
    rank = newRank;
  }
  return rank;
}

console.time('Generate web graph (300 nodes)');
const graph = generateWebGraph(300);
console.timeEnd('Generate web graph (300 nodes)');
console.log('Nodes:', graph.nodeCount(), '| Edges:', graph.edgeCount());

console.time('PageRank (30 iterations)');
const ranks = pageRank(graph);
console.timeEnd('PageRank (30 iterations)');

// Rank analysis
const sorted = [...ranks.entries()].sort((a, b) => b[1] - a[1]);
console.log('\\nTop 10 pages by PageRank:');
sorted.slice(0, 10).forEach(([id, r], i) =>
  console.log('  #' + (i+1), 'Node', id, '→ score:', r.toFixed(6))
);

// Rank distribution
const buckets = [0, 0, 0, 0, 0];
const maxRank = sorted[0][1];
for (const [, r] of ranks) {
  const bucket = Math.min(4, Math.floor((r / maxRank) * 5));
  buckets[bucket]++;
}
console.log('\\nRank distribution:');
console.log('  Very low :', buckets[0]);
console.log('  Low      :', buckets[1]);
console.log('  Medium   :', buckets[2]);
console.log('  High     :', buckets[3]);
console.log('  Very high:', buckets[4]);

// Visualize top nodes
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="600" height="100" style="background:#1a1a2e;border-radius:8px;display:block;margin:0 auto"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Draw rank bar chart for top 30
const top30 = sorted.slice(0, 30);
const barW = 600 / 30;
for (let i = 0; i < top30.length; i++) {
  const [, r] = top30[i];
  const h = (r / maxRank) * 80;
  const hue = 200 + (1 - r / maxRank) * 80;
  ctx.fillStyle = \`hsl(\${hue}, 70%, 55%)\`;
  ctx.fillRect(i * barW + 2, 90 - h, barW - 4, h);
}
ctx.fillStyle = '#aaa';
ctx.font = '11px monospace';
ctx.fillText('Top 30 nodes by PageRank score', 10, 12);
`;

const communityViz = `import { Graph } from '@graphrs/core';

// Generate a graph with clear community structure
function generateCommunityGraph(commSizes: number[], interProb: number): Graph {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  let offset = 0;
  const communities: number[][] = [];
  
  for (const size of commSizes) {
    const comm: number[] = [];
    for (let i = 0; i < size; i++) comm.push(offset + i);
    communities.push(comm);
    // Dense intra-community edges
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        if (Math.random() < 0.6) {
          const key = (offset+i) + '-' + (offset+j);
          if (!seen.has(key)) {
            seen.add(key);
            edges.push([offset + i, offset + j]);
          }
        }
      }
    }
    offset += size;
  }
  // Sparse inter-community edges
  for (let ci = 0; ci < communities.length; ci++) {
    for (let cj = ci + 1; cj < communities.length; cj++) {
      for (const a of communities[ci]) {
        for (const b of communities[cj]) {
          if (Math.random() < interProb) {
            const key = a + '-' + b;
            if (!seen.has(key)) {
              seen.add(key);
              edges.push([a, b]);
            }
          }
        }
      }
    }
  }
  return Graph.fromEdges(edges);
}

// Label Propagation community detection
function labelPropagation(graph: Graph, maxIter = 50): Map<number, number> {
  const nodes = graph.nodes();
  const labels = new Map<number, number>();
  for (const id of nodes) labels.set(id, id);
  
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    // Shuffle nodes
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    for (const node of shuffled) {
      const neighbors = graph.neighbors(node);
      if (neighbors.length === 0) continue;
      // Count neighbor labels
      const counts = new Map<number, number>();
      for (const nb of neighbors) {
        const lbl = labels.get(nb)!;
        counts.set(lbl, (counts.get(lbl) || 0) + 1);
      }
      // Pick most frequent
      let maxCount = 0, bestLabel = labels.get(node)!;
      for (const [lbl, cnt] of counts) {
        if (cnt > maxCount) { maxCount = cnt; bestLabel = lbl; }
      }
      if (bestLabel !== labels.get(node)) {
        labels.set(node, bestLabel);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return labels;
}

// Force layout (simplified for speed)
function quickLayout(graph: Graph) {
  const nodes = graph.nodes();
  const n = nodes.length;
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) pos[id] = [Math.random() * 560 + 20, Math.random() * 360 + 20];
  const k = Math.sqrt((580 * 380) / n);
  let temp = 80;
  for (let iter = 0; iter < 60; iter++) {
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
      const dx = pos[e.source][0]-pos[e.target][0], dy = pos[e.source][1]-pos[e.target][1];
      const dist = Math.max(Math.sqrt(dx*dx+dy*dy), 0.1);
      const f = (dist*dist)/k;
      disp[e.source][0] -= (dx/dist)*f; disp[e.source][1] -= (dy/dist)*f;
      disp[e.target][0] += (dx/dist)*f; disp[e.target][1] += (dy/dist)*f;
    }
    for (const v of nodes) {
      const d = Math.max(Math.sqrt(disp[v][0]**2+disp[v][1]**2), 0.1);
      const cap = Math.min(d, temp);
      pos[v][0] = Math.max(15, Math.min(585, pos[v][0]+(disp[v][0]/d)*cap));
      pos[v][1] = Math.max(15, Math.min(385, pos[v][1]+(disp[v][1]/d)*cap));
    }
    temp *= 0.93;
  }
  return pos;
}

console.time('Generate community graph');
const graph = generateCommunityGraph([30, 25, 35, 20, 28], 0.02);
console.timeEnd('Generate community graph');
console.log('Nodes:', graph.nodeCount(), '| Edges:', graph.edgeCount());

console.time('Label Propagation');
const labels = labelPropagation(graph);
console.timeEnd('Label Propagation');

// Count communities
const commMap = new Map<number, number[]>();
for (const [node, lbl] of labels) {
  if (!commMap.has(lbl)) commMap.set(lbl, []);
  commMap.get(lbl)!.push(node);
}
console.log('Communities detected:', commMap.size);
const commSizes = [...commMap.values()].map(c => c.length).sort((a,b) => b-a);
console.log('Community sizes:', commSizes.join(', '));

console.time('Force layout');
const pos = quickLayout(graph);
console.timeEnd('Force layout');

// Assign colors to communities
const commColors: Map<number, string> = new Map();
const palette = ['#ff6b6b','#4ecdc4','#45b7d1','#f9ca24','#6c5ce7','#a29bfe','#fd79a8','#00b894'];
let ci = 0;
for (const [lbl] of commMap) {
  commColors.set(lbl, palette[ci % palette.length]);
  ci++;
}

// Render
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="600" height="400" style="background:#0f0f23;border-radius:8px;display:block;margin:0 auto"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Edges
ctx.lineWidth = 0.5;
for (const e of graph.edges()) {
  const color = labels.get(e.source) === labels.get(e.target)
    ? commColors.get(labels.get(e.source)!) || '#666'
    : '#333';
  ctx.strokeStyle = color + '40';
  ctx.beginPath();
  ctx.moveTo(pos[e.source][0], pos[e.source][1]);
  ctx.lineTo(pos[e.target][0], pos[e.target][1]);
  ctx.stroke();
}

// Nodes
for (const id of graph.nodes()) {
  const [x, y] = pos[id];
  const color = commColors.get(labels.get(id)!) || '#666';
  ctx.beginPath();
  ctx.arc(x, y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

ctx.fillStyle = '#ccc';
ctx.font = '11px monospace';
ctx.fillText(commMap.size + ' communities detected via Label Propagation', 10, 15);
`;

const g6Demo = `import { Graph } from '@graphrs/core';

// Generate a social network graph with communities
function generateSocialNetwork(): Graph {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  const addEdge = (a: number, b: number) => {
    const k = Math.min(a,b)+'-'+Math.max(a,b);
    if (a !== b && !seen.has(k)) { seen.add(k); edges.push([a, b]); }
  };
  // 4 tight clusters
  const clusters = [[0,14],[15,29],[30,44],[45,59]];
  for (const [lo, hi] of clusters) {
    for (let i = lo; i <= hi; i++) {
      for (let j = i+1; j <= hi; j++) {
        if (Math.random() < 0.4) addEdge(i, j);
      }
    }
  }
  // Bridge nodes
  addEdge(12,15); addEdge(14,30); addEdge(28,45); addEdge(44,0);
  addEdge(7,32); addEdge(22,50);
  return Graph.fromEdges(edges);
}

// Betweenness centrality (simplified)
function betweenness(graph: Graph): Map<number, number> {
  const nodes = graph.nodes();
  const cb = new Map<number, number>();
  for (const v of nodes) cb.set(v, 0);
  
  for (const s of nodes) {
    const stack: number[] = [];
    const pred: Map<number, number[]> = new Map();
    const sigma: Map<number, number> = new Map();
    const dist: Map<number, number> = new Map();
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
        delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
      }
      if (w !== s) cb.set(w, cb.get(w)! + delta.get(w)!);
    }
  }
  // Normalize
  const maxCb = Math.max(...cb.values(), 1);
  for (const [k, v] of cb) cb.set(k, v / maxCb);
  return cb;
}

console.time('Generate social network');
const graph = generateSocialNetwork();
console.timeEnd('Generate social network');
console.log('Nodes:', graph.nodeCount(), '| Edges:', graph.edgeCount());

console.time('Betweenness centrality');
const bc = betweenness(graph);
console.timeEnd('Betweenness centrality');

// Find bridges (high betweenness)
const sorted = [...bc.entries()].sort((a,b) => b[1]-a[1]);
console.log('\\nTop bridge nodes (betweenness centrality):');
sorted.slice(0, 8).forEach(([id, score]) =>
  console.log('  Node', id, '→', score.toFixed(4))
);

// Convert to G6 format with computed metrics
const g6Data = graph.toG6Format();
console.log('\\n=== AntV G6 Data Format ===');
console.log('Nodes:', g6Data.nodes.length);
console.log('Edges:', g6Data.edges.length);

// Enrich with centrality (ready for G6 rendering)
for (const node of g6Data.nodes) {
  const score = bc.get(Number(node.id)) || 0;
  (node as any).data = {
    centrality: score,
    size: 8 + score * 30,
    color: score > 0.5 ? '#ff6b6b' : score > 0.2 ? '#f9ca24' : '#4ecdc4'
  };
}
console.log('\\nEnriched G6 node sample:');
console.log(JSON.stringify(g6Data.nodes.slice(0, 3), null, 2));

// Canvas visualization
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="600" height="400" style="background:#0d1117;border-radius:8px;display:block;margin:0 auto"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Simple circular layout by cluster
const nodes = graph.nodes();
const pos: Record<number, [number, number]> = {};
const clusters = [[0,14],[15,29],[30,44],[45,59]];
const centers = [[150,120],[450,120],[150,300],[450,300]];
for (let ci = 0; ci < clusters.length; ci++) {
  const [lo, hi] = clusters[ci];
  const [cx, cy] = centers[ci];
  const count = hi - lo + 1;
  for (let i = lo; i <= hi; i++) {
    if (!nodes.includes(i)) continue;
    const angle = ((i - lo) / count) * Math.PI * 2;
    const r = 60 + Math.random() * 20;
    pos[i] = [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  }
}

// Draw edges
for (const e of graph.edges()) {
  if (!pos[e.source] || !pos[e.target]) continue;
  ctx.strokeStyle = 'rgba(100,150,255,0.12)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(pos[e.source][0], pos[e.source][1]);
  ctx.lineTo(pos[e.target][0], pos[e.target][1]);
  ctx.stroke();
}

// Draw nodes (sized by betweenness)
const clusterColors = ['#ff6b6b','#4ecdc4','#45b7d1','#f9ca24'];
for (const id of nodes) {
  if (!pos[id]) continue;
  const [x, y] = pos[id];
  const score = bc.get(id) || 0;
  const ci = clusters.findIndex(([lo, hi]) => id >= lo && id <= hi);
  const baseColor = ci >= 0 ? clusterColors[ci] : '#999';
  const radius = 3 + score * 10;
  // Glow for high centrality
  if (score > 0.3) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = baseColor + '30';
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = baseColor;
  ctx.fill();
}

ctx.fillStyle = '#aaa';
ctx.font = '11px monospace';
ctx.fillText('Social network · 4 communities · Bridge nodes highlighted by size', 10, 15);
`;
</script>

# Interactive Playground

Edit the code and see results instantly. Each example runs in a real sandbox with `@graphrs/core`.

## Large-Scale BFS & Connected Components

Generate a random graph with 200 nodes and analyze its structure using BFS traversal and connected component detection:

<Playground :code="largeBFS" />

## Scale-Free Network + Force Layout

Generate a Barabási–Albert scale-free network (150 nodes), compute a force-directed layout, and render it on canvas. Hub nodes (high degree) appear larger and brighter:

<Playground :code="canvasViz" />

## Community Detection Visualization

Generate a graph with planted community structure (138 nodes, 5 communities), detect communities using Label Propagation, and visualize with force layout. Colors indicate detected communities:

<Playground :code="communityViz" />

## Social Network Analysis + AntV G6

Build a social network with 4 clusters, compute betweenness centrality to identify bridge nodes, and export to AntV G6 format. Bridge nodes (connecting communities) are highlighted:

<Playground :code="g6Demo" />
