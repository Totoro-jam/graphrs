import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import { maxFlow, minCut, vertexConnectivity, edgeConnectivity, isConnected } from '../index.js';

describe('@graphrs/flow integration (WASM)', () => {
  describe('maxFlow', () => {
    it('computes max flow on simple directed graph', async () => {
      // Two parallel paths from 0 to 3:
      //   0 -> 1 -> 3 (capacity 1 each edge, unit capacity)
      //   0 -> 2 -> 3 (capacity 1 each edge, unit capacity)
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 3],
          [0, 2],
          [2, 3],
        ],
        { directed: true },
      );
      const result = await maxFlow(g, 0, 3);
      expect(result.value).toBe(2);
      expect(result.flow).toHaveLength(4);
    });

    it('max flow respects bottleneck', async () => {
      // Single path 0 -> 1 -> 2, unit capacity means flow = 1
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 2],
        ],
        { directed: true },
      );
      const result = await maxFlow(g, 0, 2);
      expect(result.value).toBe(1);
    });

    it('max flow is zero when no path exists', async () => {
      // 0 -> 1, 2 -> 3 (no path from 0 to 3)
      const g = Graph.fromEdges(
        [
          [0, 1],
          [2, 3],
        ],
        { directed: true },
      );
      const result = await maxFlow(g, 0, 3);
      expect(result.value).toBe(0);
    });
  });

  describe('minCut', () => {
    it('computes min cut on simple directed graph', async () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 3],
          [0, 2],
          [2, 3],
        ],
        { directed: true },
      );
      const result = await minCut(g, 0, 3);
      expect(result.value).toBe(2);
      expect(result.partition).toHaveLength(2);
      // Source should be in one partition, target in another
      const [p1, p2] = result.partition;
      const sourceInP1 = p1.includes(0);
      const targetInP2 = p2.includes(3);
      const targetInP1 = p1.includes(3);
      const sourceInP2 = p2.includes(0);
      expect(sourceInP1 !== targetInP1 || sourceInP2 !== targetInP2).toBe(true);
    });

    it('min cut edges separate source from target', async () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 2],
        ],
        { directed: true },
      );
      const result = await minCut(g, 0, 2);
      expect(result.value).toBe(1);
      expect(result.cutEdges.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('isConnected', () => {
    it('connected graph returns true', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      const result = await isConnected(g);
      expect(result).toBe(true);
    });

    it('disconnected graph returns false', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [2, 3],
      ]);
      // Nodes 0-1 and 2-3 are separate components
      const result = await isConnected(g);
      expect(result).toBe(false);
    });

    it('single node graph is connected', async () => {
      const g = new Graph();
      g.addNode(0);
      const result = await isConnected(g);
      expect(result).toBe(true);
    });

    it('complete graph is connected', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
      const result = await isConnected(g);
      expect(result).toBe(true);
    });
  });

  describe('edgeConnectivity', () => {
    it('4-cycle has edge connectivity 2', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ]);
      const result = await edgeConnectivity(g);
      expect(result).toBe(2);
    });

    it('path graph has edge connectivity 1', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      const result = await edgeConnectivity(g);
      expect(result).toBe(1);
    });

    it('K4 has edge connectivity 3', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
      const result = await edgeConnectivity(g);
      expect(result).toBe(3);
    });
  });

  describe('vertexConnectivity', () => {
    it('K4 has vertex connectivity 3', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
      const result = await vertexConnectivity(g);
      expect(result).toBe(3);
    });

    it('path graph has vertex connectivity 1', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      const result = await vertexConnectivity(g);
      expect(result).toBe(1);
    });

    it('4-cycle has vertex connectivity 2', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ]);
      const result = await vertexConnectivity(g);
      expect(result).toBe(2);
    });
  });

  describe('undirected flow', () => {
    it('max flow on undirected graph treats edges as bidirectional', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const result = await maxFlow(g, 0, 2);
      expect(result.value).toBe(1);
    });

    it('min cut on undirected triangle', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 0],
      ]);
      const result = await minCut(g, 0, 2);
      expect(result.value).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('isConnected on two-node connected graph', async () => {
      const g = Graph.fromEdges([[0, 1]]);
      const result = await isConnected(g);
      expect(result).toBe(true);
    });

    it('edgeConnectivity of single edge is 1', async () => {
      const g = Graph.fromEdges([[0, 1]]);
      const result = await edgeConnectivity(g);
      expect(result).toBe(1);
    });

    it('max flow from source to self throws', async () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 2],
        ],
        { directed: true },
      );
      await expect(maxFlow(g, 0, 0)).rejects.toThrow();
    });

    it('K5 has edge connectivity 4', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
        [3, 4],
      ]);
      const result = await edgeConnectivity(g);
      expect(result).toBe(4);
    });
  });
});
