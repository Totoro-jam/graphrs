import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import {
  union,
  intersection,
  difference,
  simplify,
  reverse,
  toDirected,
  toUndirected,
  inducedSubgraph,
  complement,
} from '../index.js';

describe('@graphrs/operators integration (WASM)', () => {
  describe('union', () => {
    it('merges edges from two graphs', async () => {
      const g1 = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const g2 = Graph.fromEdges([
        [2, 3],
        [3, 4],
      ]);
      const result = await union(g1, g2);
      expect(result.nodeCount()).toBeGreaterThanOrEqual(5);
      expect(result.edgeCount()).toBe(4);
    });

    it('union of identical graphs keeps same edges', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const result = await union(g, g);
      expect(result.nodeCount()).toBe(3);
      expect(result.edgeCount()).toBe(2);
    });
  });

  describe('intersection', () => {
    it('keeps only shared edges', async () => {
      const g1 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      const g2 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [3, 4],
      ]);
      const result = await intersection(g1, g2);
      expect(result.edgeCount()).toBe(2);
    });

    it('intersection of disjoint graphs has no edges', async () => {
      const g1 = Graph.fromEdges([[0, 1]]);
      const g2 = Graph.fromEdges([[2, 3]]);
      const result = await intersection(g1, g2);
      expect(result.edgeCount()).toBe(0);
    });
  });

  describe('difference', () => {
    it('removes edges present in second graph', async () => {
      const g1 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      const g2 = Graph.fromEdges([
        [1, 2],
        [2, 3],
      ]);
      const result = await difference(g1, g2);
      expect(result.edgeCount()).toBe(1);
    });
  });

  describe('simplify', () => {
    it('removes self-loops', async () => {
      const g = new Graph();
      g.addNode(0);
      g.addNode(1);
      g.addEdge(0, 1);
      g.addEdge(0, 0); // self-loop
      const result = await simplify(g);
      expect(result.edgeCount()).toBe(1);
    });

    it('removes multi-edges', async () => {
      const g = new Graph();
      g.addNode(0);
      g.addNode(1);
      g.addEdge(0, 1);
      g.addEdge(0, 1); // duplicate
      const result = await simplify(g);
      expect(result.edgeCount()).toBe(1);
    });

    it('simple graph is unchanged', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      const result = await simplify(g);
      expect(result.edgeCount()).toBe(3);
      expect(result.nodeCount()).toBe(4);
    });
  });

  describe('reverse', () => {
    it('flips directed edges', async () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 2],
        ],
        { directed: true },
      );
      const result = await reverse(g);
      const edges = result._getEdgePairs();
      // Original: 0->1, 1->2 becomes 1->0, 2->1
      const hasReversed01 = edges.some(([u, v]) => u === 1 && v === 0);
      const hasReversed12 = edges.some(([u, v]) => u === 2 && v === 1);
      expect(hasReversed01).toBe(true);
      expect(hasReversed12).toBe(true);
    });

    it('reverse preserves node count', async () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 2],
          [2, 3],
        ],
        { directed: true },
      );
      const result = await reverse(g);
      expect(result.nodeCount()).toBe(4);
      expect(result.edgeCount()).toBe(3);
    });
  });

  describe('toDirected / toUndirected', () => {
    it('toDirected converts undirected to directed (mutual edges)', async () => {
      const g = Graph.fromEdges([[0, 1]]);
      const result = await toDirected(g);
      expect(result.directed).toBe(true);
      // Mutual mode: each undirected edge becomes two directed edges
      expect(result.edgeCount()).toBe(2);
    });

    it('toUndirected collapses directed edges', async () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 0],
        ],
        { directed: true },
      );
      const result = await toUndirected(g);
      expect(result.directed).toBe(false);
      expect(result.edgeCount()).toBe(1);
    });
  });

  describe('complement', () => {
    it('complement of K3 has 0 edges', async () => {
      const k3 = Graph.fromEdges([
        [0, 1],
        [0, 2],
        [1, 2],
      ]);
      const result = await complement(k3);
      expect(result.nodeCount()).toBe(3);
      expect(result.edgeCount()).toBe(0);
    });

    it('complement of path(3) has correct edge count', async () => {
      // Path 0-1-2 has 2 edges; K3 has 3 edges; complement should have 1 edge (0-2)
      const p = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const result = await complement(p);
      expect(result.nodeCount()).toBe(3);
      expect(result.edgeCount()).toBe(1);
    });

    it('complement of complement returns original edge count', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [2, 3],
      ]);
      const comp = await complement(g);
      const original = await complement(comp);
      expect(original.edgeCount()).toBe(2);
    });
  });

  describe('inducedSubgraph', () => {
    it('extracts subgraph with specified nodes', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
      ]);
      const result = await inducedSubgraph(g, [1, 2, 3]);
      expect(result.nodeCount()).toBe(3);
      expect(result.edgeCount()).toBe(2);
    });

    it('single node subgraph has no edges', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const result = await inducedSubgraph(g, [0]);
      expect(result.nodeCount()).toBe(1);
      expect(result.edgeCount()).toBe(0);
    });

    it('preserves directedness', async () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 2],
          [2, 0],
        ],
        { directed: true },
      );
      const result = await inducedSubgraph(g, [0, 1, 2]);
      expect(result.directed).toBe(true);
      expect(result.edgeCount()).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('complement of path(4) has correct edges', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      const result = await complement(g);
      expect(result.edgeCount()).toBe(3);
    });

    it('simplify on already-simple graph is identity', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const result = await simplify(g);
      expect(result.edgeCount()).toBe(2);
      expect(result.nodeCount()).toBe(3);
    });

    it('union is commutative', async () => {
      const g1 = Graph.fromEdges([[0, 1]]);
      const g2 = Graph.fromEdges([[1, 2]]);
      const [ab, ba] = await Promise.all([union(g1, g2), union(g2, g1)]);
      expect(ab.edgeCount()).toBe(ba.edgeCount());
      expect(ab.nodeCount()).toBe(ba.nodeCount());
    });

    it('intersection is commutative', async () => {
      const g1 = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const g2 = Graph.fromEdges([
        [1, 2],
        [2, 3],
      ]);
      const [ab, ba] = await Promise.all([intersection(g1, g2), intersection(g2, g1)]);
      expect(ab.edgeCount()).toBe(ba.edgeCount());
    });

    it('reverse of reverse restores original edge directions', async () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 2],
        ],
        { directed: true },
      );
      const rr = await reverse(g).then((r) => reverse(r));
      const edges = rr._getEdgePairs();
      expect(edges.some(([u, v]) => u === 0 && v === 1)).toBe(true);
      expect(edges.some(([u, v]) => u === 1 && v === 2)).toBe(true);
    });

    it('toDirected then toUndirected preserves edge count', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const directed = await toDirected(g);
      const undirected = await toUndirected(directed);
      expect(undirected.edgeCount()).toBe(2);
      expect(undirected.directed).toBe(false);
    });
  });
});
