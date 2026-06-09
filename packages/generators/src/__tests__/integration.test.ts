import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import {
  erdosRenyi,
  barabasiAlbert,
  wattsStrogatz,
  stochasticBlockModel,
  complete,
  ring,
  lattice,
  star,
  tree,
  path,
} from '../index.js';

describe('@graphrs/generators integration (WASM)', () => {
  describe('random generators', () => {
    it('erdosRenyi generates graph with expected node count and plausible edges', async () => {
      const g = await erdosRenyi({ n: 50, p: 0.1 });
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(50);
      // Expected edges ~ n*(n-1)/2 * p = 50*49/2*0.1 = 122.5
      expect(g.edgeCount()).toBeGreaterThan(30);
      expect(g.edgeCount()).toBeLessThan(400);
    });

    it('barabasiAlbert generates graph with 100 nodes and ~297 edges', async () => {
      const g = await barabasiAlbert({ n: 100, m: 3 });
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(100);
      // BA model: first m+1 nodes form clique, then (n - m - 1) nodes add m edges each
      // edges = m*(m+1)/2 + (n - m - 1)*m = 6 + 96*3 = 294
      expect(g.edgeCount()).toBeGreaterThan(250);
      expect(g.edgeCount()).toBeLessThan(350);
    });

    it('wattsStrogatz generates graph with exact node and edge counts', async () => {
      const g = await wattsStrogatz({ n: 20, k: 4, p: 0.3 });
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(20);
      // igraph WS creates n*k edges (each node connects to k neighbors)
      expect(g.edgeCount()).toBe(80);
    });

    it('stochasticBlockModel generates graph with correct total nodes', async () => {
      const g = await stochasticBlockModel({
        blockSizes: [10, 10],
        prefMatrix: [
          [0.5, 0.05],
          [0.05, 0.5],
        ],
      });
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(20);
      expect(g.edgeCount()).toBeGreaterThan(0);
    });

    it('stochasticBlockModel has more intra-block than inter-block edges', async () => {
      const g = await stochasticBlockModel({
        blockSizes: [10, 10],
        prefMatrix: [
          [0.9, 0.01],
          [0.01, 0.9],
        ],
      });
      const edges = g._getEdgePairs();
      let intra = 0;
      let inter = 0;
      for (const [u, v] of edges) {
        if ((u < 10 && v < 10) || (u >= 10 && v >= 10)) {
          intra++;
        } else {
          inter++;
        }
      }
      expect(intra).toBeGreaterThan(inter);
    });
  });

  describe('deterministic generators', () => {
    it('complete(5) generates K5 with 5 nodes and 10 edges', async () => {
      const g = await complete(5);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(5);
      expect(g.edgeCount()).toBe(10);
    });

    it('complete(1) generates single node with no edges', async () => {
      const g = await complete(1);
      expect(g.nodeCount()).toBe(1);
      expect(g.edgeCount()).toBe(0);
    });

    it('ring(8) generates cycle with 8 nodes and 8 edges', async () => {
      const g = await ring(8);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(8);
      expect(g.edgeCount()).toBe(8);
    });

    it('lattice([3,3]) generates 3x3 grid with 9 nodes and 12 edges', async () => {
      const g = await lattice([3, 3]);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(9);
      expect(g.edgeCount()).toBe(12);
    });

    it('lattice([2,2,2]) generates 3D lattice with 8 nodes', async () => {
      const g = await lattice([2, 2, 2]);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(8);
      expect(g.edgeCount()).toBe(12);
    });

    it('star(6) generates star with correct structure', async () => {
      const g = await star(6);
      expect(g).toBeInstanceOf(Graph);
      // igraph starGraph(n) creates n total nodes
      expect(g.nodeCount()).toBe(6);
      expect(g.edgeCount()).toBe(5);
    });

    it('tree(15) generates tree with 15 nodes and 14 edges', async () => {
      const g = await tree(15);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(15);
      // A tree with n nodes has n-1 edges
      expect(g.edgeCount()).toBe(14);
    });

    it('tree(7, 3) generates ternary tree', async () => {
      const g = await tree(7, 3);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(7);
      expect(g.edgeCount()).toBe(6);
    });

    it('path(5) generates path with 5 nodes and 4 edges', async () => {
      const g = await path(5);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(5);
      expect(g.edgeCount()).toBe(4);
    });

    it('path graph nodes are connected in sequence', async () => {
      const g = await path(4);
      const edges = g._getEdgePairs();
      expect(edges).toHaveLength(3);
      // Each edge connects consecutive nodes
      for (const [u, v] of edges) {
        expect(Math.abs(u - v)).toBe(1);
      }
    });
  });

  describe('generated graph properties', () => {
    it('all generated graphs are undirected by default', async () => {
      const graphs = await Promise.all([
        erdosRenyi({ n: 5, p: 0.5 }),
        barabasiAlbert({ n: 10, m: 2 }),
        complete(4),
        ring(5),
        path(3),
      ]);
      for (const g of graphs) {
        expect(g.directed).toBe(false);
      }
    });

    it('nodes are zero-indexed integers', async () => {
      const g = await complete(5);
      const nodes = g.nodes();
      expect(nodes.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
    });
  });
});
