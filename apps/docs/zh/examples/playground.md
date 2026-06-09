<script setup>
const largeBFS = `import { Graph } from '@graphrs/core';

// 生成大规模随机图（200 节点，约 600 条边）
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

// BFS 广度优先遍历实现
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

console.time('图生成');
const graph = generateLargeGraph(200, 6);
console.timeEnd('图生成');
console.log('节点:', graph.nodeCount(), '| 边:', graph.edgeCount());

console.time('BFS 遍历');
const { visited, layers } = bfs(graph, 0);
console.timeEnd('BFS 遍历');
console.log('BFS 到达', visited.length, '个节点，共', layers.length, '层');
console.log('每层大小:', layers.map(l => l.length).join(' → '));

// 连通分量分析
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

console.time('连通分量');
const components = connectedComponents(graph);
console.timeEnd('连通分量');
console.log('\\n连通分量数:', components.length);
components.slice(0, 5).forEach((c, i) =>
  console.log('  分量', i + 1 + ':', c.length, '个节点')
);
`;

const canvasViz = `import { Graph } from '@graphrs/core';

// 生成无标度网络（Barabási–Albert 模型）
function barabasiAlbert(n: number, m: number): Graph {
  const edges: [number, number][] = [];
  const degree: number[] = new Array(n).fill(0);
  // 以 m+1 个节点的完全图开始
  for (let i = 0; i <= m; i++) {
    for (let j = i + 1; j <= m; j++) {
      edges.push([i, j]);
      degree[i]++;
      degree[j]++;
    }
  }
  // 优先连接
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

// 力导向布局（Fruchterman-Reingold）
function forceLayout(graph: Graph, iterations = 80) {
  const nodes = graph.nodes();
  const n = nodes.length;
  const W = 580, H = 380;
  const area = W * H;
  const k = Math.sqrt(area / n);
  const pos: Record<number, [number, number]> = {};
  for (const id of nodes) {
    pos[id] = [Math.random() * W, Math.random() * H];
  }
  let temp = W / 5;
  for (let iter = 0; iter < iterations; iter++) {
    const disp: Record<number, [number, number]> = {};
    for (const v of nodes) disp[v] = [0, 0];
    // 斥力
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
    // 引力
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
    // 应用温度衰减
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

console.time('生成 BA 网络（150 节点）');
const graph = barabasiAlbert(150, 3);
console.timeEnd('生成 BA 网络（150 节点）');
console.log('节点:', graph.nodeCount(), '| 边:', graph.edgeCount());

console.time('力导向布局');
const pos = forceLayout(graph);
console.timeEnd('力导向布局');

// 计算度数用于节点大小
const degrees: Record<number, number> = {};
for (const id of graph.nodes()) degrees[id] = graph.degree(id);
const maxDeg = Math.max(...Object.values(degrees));

// 渲染到 Canvas
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="600" height="400" style="background:#1a1a2e;border-radius:8px;display:block;margin:0 auto"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// 绘制边
ctx.strokeStyle = 'rgba(100,160,255,0.15)';
ctx.lineWidth = 0.8;
for (const e of graph.edges()) {
  ctx.beginPath();
  ctx.moveTo(pos[e.source][0] + 10, pos[e.source][1] + 10);
  ctx.lineTo(pos[e.target][0] + 10, pos[e.target][1] + 10);
  ctx.stroke();
}

// 绘制节点（大小 = 度数）
for (const id of graph.nodes()) {
  const [x, y] = pos[id];
  const r = 2 + (degrees[id] / maxDeg) * 8;
  const hue = 200 + (degrees[id] / maxDeg) * 60;
  ctx.beginPath();
  ctx.arc(x + 10, y + 10, r, 0, Math.PI * 2);
  ctx.fillStyle = \`hsl(\${hue}, 80%, \${50 + (degrees[id]/maxDeg)*20}%)\`;
  ctx.fill();
}

// 枢纽节点分析
const sorted = Object.entries(degrees).sort((a, b) => b[1] - a[1]);
console.log('\\n前 5 大枢纽节点（度数）:');
sorted.slice(0, 5).forEach(([id, deg]) => console.log('  节点', id + ':', deg, '条连接'));
`;

const pageRankViz = `import { Graph } from '@graphrs/core';

// 生成类似网页链接的有向图（300 节点）
function generateWebGraph(n: number): Graph {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  // 创建骨干集群
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
  // 添加跨集群链接
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

// PageRank 实现（幂迭代法）
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

console.time('生成网页图（300 节点）');
const graph = generateWebGraph(300);
console.timeEnd('生成网页图（300 节点）');
console.log('节点:', graph.nodeCount(), '| 边:', graph.edgeCount());

console.time('PageRank（30 次迭代）');
const ranks = pageRank(graph);
console.timeEnd('PageRank（30 次迭代）');

// 排名分析
const sorted = [...ranks.entries()].sort((a, b) => b[1] - a[1]);
console.log('\\nPageRank 前 10:');
sorted.slice(0, 10).forEach(([id, r], i) =>
  console.log('  #' + (i+1), '节点', id, '→ 分数:', r.toFixed(6))
);

// 排名分布
const buckets = [0, 0, 0, 0, 0];
const maxRank = sorted[0][1];
for (const [, r] of ranks) {
  const bucket = Math.min(4, Math.floor((r / maxRank) * 5));
  buckets[bucket]++;
}
console.log('\\n排名分布:');
console.log('  极低  :', buckets[0]);
console.log('  低    :', buckets[1]);
console.log('  中等  :', buckets[2]);
console.log('  高    :', buckets[3]);
console.log('  极高  :', buckets[4]);

// 可视化前 30 名
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="600" height="100" style="background:#1a1a2e;border-radius:8px;display:block;margin:0 auto"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

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
ctx.fillText('PageRank 前 30 节点得分柱状图', 10, 12);
`;

const communityViz = `import { Graph } from '@graphrs/core';

// 生成具有明显社区结构的图
function generateCommunityGraph(commSizes: number[], interProb: number): Graph {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  let offset = 0;
  const communities: number[][] = [];
  
  for (const size of commSizes) {
    const comm: number[] = [];
    for (let i = 0; i < size; i++) comm.push(offset + i);
    communities.push(comm);
    // 社区内部密集连接
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
  // 社区间稀疏连接
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

// 标签传播社区检测
function labelPropagation(graph: Graph, maxIter = 50): Map<number, number> {
  const nodes = graph.nodes();
  const labels = new Map<number, number>();
  for (const id of nodes) labels.set(id, id);
  
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    for (const node of shuffled) {
      const neighbors = graph.neighbors(node);
      if (neighbors.length === 0) continue;
      const counts = new Map<number, number>();
      for (const nb of neighbors) {
        const lbl = labels.get(nb)!;
        counts.set(lbl, (counts.get(lbl) || 0) + 1);
      }
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

// 快速力导向布局
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

console.time('生成社区图');
const graph = generateCommunityGraph([30, 25, 35, 20, 28], 0.02);
console.timeEnd('生成社区图');
console.log('节点:', graph.nodeCount(), '| 边:', graph.edgeCount());

console.time('标签传播');
const labels = labelPropagation(graph);
console.timeEnd('标签传播');

// 统计社区
const commMap = new Map<number, number[]>();
for (const [node, lbl] of labels) {
  if (!commMap.has(lbl)) commMap.set(lbl, []);
  commMap.get(lbl)!.push(node);
}
console.log('检测到社区数:', commMap.size);
const commSizes = [...commMap.values()].map(c => c.length).sort((a,b) => b-a);
console.log('社区大小:', commSizes.join(', '));

console.time('力导向布局');
const pos = quickLayout(graph);
console.timeEnd('力导向布局');

// 分配颜色
const commColors: Map<number, string> = new Map();
const palette = ['#ff6b6b','#4ecdc4','#45b7d1','#f9ca24','#6c5ce7','#a29bfe','#fd79a8','#00b894'];
let ci = 0;
for (const [lbl] of commMap) {
  commColors.set(lbl, palette[ci % palette.length]);
  ci++;
}

// 渲染
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="600" height="400" style="background:#0f0f23;border-radius:8px;display:block;margin:0 auto"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

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
ctx.fillText('标签传播检测到 ' + commMap.size + ' 个社区', 10, 15);
`;

const g6Demo = `import { Graph } from '@graphrs/core';

// 生成带社区结构的社交网络图
function generateSocialNetwork(): Graph {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  const addEdge = (a: number, b: number) => {
    const k = Math.min(a,b)+'-'+Math.max(a,b);
    if (a !== b && !seen.has(k)) { seen.add(k); edges.push([a, b]); }
  };
  // 4 个紧密集群
  const clusters = [[0,14],[15,29],[30,44],[45,59]];
  for (const [lo, hi] of clusters) {
    for (let i = lo; i <= hi; i++) {
      for (let j = i+1; j <= hi; j++) {
        if (Math.random() < 0.4) addEdge(i, j);
      }
    }
  }
  // 桥接节点
  addEdge(12,15); addEdge(14,30); addEdge(28,45); addEdge(44,0);
  addEdge(7,32); addEdge(22,50);
  return Graph.fromEdges(edges);
}

// 介数中心性（简化版）
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
  const maxCb = Math.max(...cb.values(), 1);
  for (const [k, v] of cb) cb.set(k, v / maxCb);
  return cb;
}

console.time('生成社交网络');
const graph = generateSocialNetwork();
console.timeEnd('生成社交网络');
console.log('节点:', graph.nodeCount(), '| 边:', graph.edgeCount());

console.time('介数中心性');
const bc = betweenness(graph);
console.timeEnd('介数中心性');

// 找出桥接节点
const sorted = [...bc.entries()].sort((a,b) => b[1]-a[1]);
console.log('\\n关键桥接节点（介数中心性）:');
sorted.slice(0, 8).forEach(([id, score]) =>
  console.log('  节点', id, '→', score.toFixed(4))
);

// 转换为 G6 格式
const g6Data = graph.toG6Format();
console.log('\\n=== AntV G6 数据格式 ===');
console.log('节点:', g6Data.nodes.length);
console.log('边:', g6Data.edges.length);

// 用中心性指标增强节点数据
for (const node of g6Data.nodes) {
  const score = bc.get(Number(node.id)) || 0;
  (node as any).data = {
    centrality: score,
    size: 8 + score * 30,
    color: score > 0.5 ? '#ff6b6b' : score > 0.2 ? '#f9ca24' : '#4ecdc4'
  };
}
console.log('\\n增强后的 G6 节点示例:');
console.log(JSON.stringify(g6Data.nodes.slice(0, 3), null, 2));

// Canvas 可视化
const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="c" width="600" height="400" style="background:#0d1117;border-radius:8px;display:block;margin:0 auto"></canvas>';
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// 按集群环形布局
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

// 绘制边
for (const e of graph.edges()) {
  if (!pos[e.source] || !pos[e.target]) continue;
  ctx.strokeStyle = 'rgba(100,150,255,0.12)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(pos[e.source][0], pos[e.source][1]);
  ctx.lineTo(pos[e.target][0], pos[e.target][1]);
  ctx.stroke();
}

// 绘制节点（大小按介数中心性）
const clusterColors = ['#ff6b6b','#4ecdc4','#45b7d1','#f9ca24'];
for (const id of nodes) {
  if (!pos[id]) continue;
  const [x, y] = pos[id];
  const score = bc.get(id) || 0;
  const ci = clusters.findIndex(([lo, hi]) => id >= lo && id <= hi);
  const baseColor = ci >= 0 ? clusterColors[ci] : '#999';
  const radius = 3 + score * 10;
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
ctx.fillText('社交网络 · 4 个社区 · 桥接节点按大小突出显示', 10, 15);
`;
</script>

# 交互式演练场

编辑代码并即时查看结果。每个示例都在真实沙箱中运行，使用 `@graphrs/core`。

## 大规模 BFS 与连通分量

生成 200 节点的随机图，使用 BFS 遍历分析结构并检测连通分量：

<Playground :code="largeBFS" />

## 无标度网络 + 力导向布局

生成 Barabási–Albert 无标度网络（150 节点），计算力导向布局并渲染到 Canvas。枢纽节点（高度数）显示更大更亮：

<Playground :code="canvasViz" />

## 社区检测可视化

生成具有社区结构的图（138 节点，5 个社区），使用标签传播算法检测社区，并用力导向布局可视化。颜色表示检测到的社区：

<Playground :code="communityViz" />

## 社交网络分析 + AntV G6

构建 4 个集群的社交网络，计算介数中心性以识别桥接节点，并导出为 AntV G6 格式。连接社区的桥接节点被突出显示：

<Playground :code="g6Demo" />
