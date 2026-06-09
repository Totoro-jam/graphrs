import { describe, it, expect } from 'vitest';
import { Graph } from '../graph.js';

describe('Playground demo scenarios', () => {
  describe('Large-scale BFS', () => {
    it('should generate and traverse a 200-node random graph', () => {
      const edges: [number, number][] = [];
      const seen = new Set<string>();
      const nodeCount = 200;
      const edgeCount = 600;
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
      const graph = Graph.fromEdges(edges);
      expect(graph.nodeCount()).toBeGreaterThan(100);
      expect(graph.edgeCount()).toBe(600);

      // BFS from node 0
      const visited: number[] = [];
      const bfsQueue = [0];
      const bfsSeen = new Set<number>([0]);
      while (bfsQueue.length > 0) {
        const node = bfsQueue.shift()!;
        visited.push(node);
        for (const nb of graph.neighbors(node)) {
          if (!bfsSeen.has(nb)) {
            bfsSeen.add(nb);
            bfsQueue.push(nb);
          }
        }
      }
      expect(visited.length).toBeGreaterThan(0);
      expect(visited[0]).toBe(0);
    });
  });

  describe('Barabási–Albert network', () => {
    it('should generate a scale-free graph with correct structure', () => {
      const n = 50;
      const m = 3;
      const edges: [number, number][] = [];
      const degree: number[] = new Array(n).fill(0);
      for (let i = 0; i <= m; i++) {
        for (let j = i + 1; j <= m; j++) {
          edges.push([i, j]);
          degree[i] = (degree[i] ?? 0) + 1;
          degree[j] = (degree[j] ?? 0) + 1;
        }
      }
      for (let i = m + 1; i < n; i++) {
        const targets = new Set<number>();
        const totalDeg = degree.reduce((a, b) => a + b, 0);
        while (targets.size < m) {
          let r = Math.random() * totalDeg;
          for (let j = 0; j < i; j++) {
            r -= degree[j] ?? 0;
            if (r <= 0) {
              targets.add(j);
              break;
            }
          }
        }
        for (const t of targets) {
          edges.push([i, t]);
          degree[i] = (degree[i] ?? 0) + 1;
          degree[t] = (degree[t] ?? 0) + 1;
        }
      }
      const graph = Graph.fromEdges(edges);
      expect(graph.nodeCount()).toBe(n);
      expect(graph.edgeCount()).toBeGreaterThan(n);

      // Hub analysis: top nodes should have higher degree
      const degrees: Record<number, number> = {};
      for (const id of graph.nodes()) degrees[id] = graph.degree(id);
      const sorted = Object.entries(degrees).sort((a, b) => b[1] - a[1]);
      expect(sorted[0]![1]).toBeGreaterThan(sorted[sorted.length - 1]![1]);
    });
  });

  describe('Community detection (Label Propagation)', () => {
    it('should detect communities in a planted structure', () => {
      const edges: [number, number][] = [];
      // Two dense clusters
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          edges.push([i, j]);
        }
      }
      for (let i = 10; i < 20; i++) {
        for (let j = i + 1; j < 20; j++) {
          edges.push([i, j]);
        }
      }
      // One bridge edge
      edges.push([5, 15]);
      const graph = Graph.fromEdges(edges);
      expect(graph.nodeCount()).toBe(20);

      // Label propagation
      const nodes = graph.nodes();
      const labels = new Map<number, number>();
      for (const id of nodes) labels.set(id, id);
      for (let iter = 0; iter < 30; iter++) {
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
          let maxCount = 0,
            bestLabel = labels.get(node)!;
          for (const [lbl, cnt] of counts) {
            if (cnt > maxCount) {
              maxCount = cnt;
              bestLabel = lbl;
            }
          }
          if (bestLabel !== labels.get(node)) {
            labels.set(node, bestLabel);
            changed = true;
          }
        }
        if (!changed) break;
      }

      // Should find ~2 communities
      const uniqueLabels = new Set(labels.values());
      expect(uniqueLabels.size).toBeLessThanOrEqual(4);
      expect(uniqueLabels.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Betweenness centrality', () => {
    it('should identify bridge nodes correctly', () => {
      // Two triangles connected by a bridge
      const graph = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 0],
        [2, 3], // bridge
        [3, 4],
        [4, 5],
        [5, 3],
      ]);

      // Simplified betweenness
      const nodes = graph.nodes();
      const cb = new Map<number, number>();
      for (const v of nodes) cb.set(v, 0);

      for (const s of nodes) {
        const stack: number[] = [];
        const pred: Map<number, number[]> = new Map();
        const sigma: Map<number, number> = new Map();
        const dist: Map<number, number> = new Map();
        for (const v of nodes) {
          pred.set(v, []);
          sigma.set(v, 0);
          dist.set(v, -1);
        }
        sigma.set(s, 1);
        dist.set(s, 0);
        const queue = [s];
        while (queue.length > 0) {
          const v = queue.shift()!;
          stack.push(v);
          for (const w of graph.neighbors(v)) {
            if (dist.get(w)! < 0) {
              queue.push(w);
              dist.set(w, dist.get(v)! + 1);
            }
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

      // Nodes 2 and 3 are bridges — should have highest betweenness
      const sorted = [...cb.entries()].sort((a, b) => b[1] - a[1]);
      expect([2, 3]).toContain(sorted[0]![0]);
      expect([2, 3]).toContain(sorted[1]![0]);
    });
  });

  describe('G6 format export', () => {
    it('should produce valid G6 data format', () => {
      const graph = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 0],
      ]);
      graph.addNode(0, { label: 'A' });

      const g6Data = graph.toG6Format();
      expect(g6Data.nodes).toHaveLength(3);
      expect(g6Data.edges).toHaveLength(3);
      expect(g6Data.nodes[0]).toHaveProperty('id');
      expect(g6Data.edges[0]).toHaveProperty('source');
      expect(g6Data.edges[0]).toHaveProperty('target');
    });
  });

  describe('PageRank computation', () => {
    it('should compute PageRank on a directed graph', () => {
      const graph = Graph.fromEdges(
        [
          [0, 1],
          [1, 2],
          [2, 0],
          [2, 3],
        ],
        { directed: true },
      );

      const nodes = graph.nodes();
      const n = nodes.length;
      const outDeg = new Map<number, number>();
      const inLinks = new Map<number, number[]>();
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
      for (let iter = 0; iter < 30; iter++) {
        const newRank = new Map<number, number>();
        for (const id of nodes) {
          let sum = 0;
          for (const src of inLinks.get(id)!) {
            sum += (rank.get(src) || 0) / (outDeg.get(src) || 1);
          }
          newRank.set(id, (1 - 0.85) / n + 0.85 * sum);
        }
        rank = newRank;
      }

      // All ranks should be positive
      for (const [, r] of rank) {
        expect(r).toBeGreaterThan(0);
      }
      // Sum of ranks should be positive (dangling nodes cause rank leak in basic implementation)
      const total = [...rank.values()].reduce((a, b) => a + b, 0);
      expect(total).toBeGreaterThan(0);
      expect(total).toBeLessThanOrEqual(1);
    });
  });
});
