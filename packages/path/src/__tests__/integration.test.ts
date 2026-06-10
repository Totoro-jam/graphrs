import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import { dijkstra, bellmanFord, bfs, dfs, allPairsShortestPaths } from '../index.js';

const line = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
]);

const cycle = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
]);

const disconnected = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [3, 4],
  [4, 5],
]);

describe('@graphrs/path integration', () => {
  describe('dijkstra', () => {
    it('finds correct distance on line graph', async () => {
      const result = await dijkstra(line, 0, 4);
      expect(result.distance).toBe(4);
    });

    it('finds shorter distance on cycle graph', async () => {
      const result = await dijkstra(cycle, 0, 3);
      expect(result.distance).toBe(2);
    });

    it('source to self has distance 0', async () => {
      const result = await dijkstra(line, 2, 2);
      expect(result.distance).toBe(0);
    });
  });

  describe('bellmanFord', () => {
    it('returns same distance as dijkstra on unweighted', async () => {
      const dResult = await dijkstra(line, 0, 4);
      const bResult = await bellmanFord(line, 0, 4);
      expect(bResult.distance).toBe(dResult.distance);
    });
  });

  describe('bfs', () => {
    it('visits all reachable nodes from root', async () => {
      const result = await bfs(line, 0);
      expect(result.order).toHaveLength(5);
      expect(result.order[0]).toBe(0);
      expect(new Set(result.order).size).toBe(5);
    });

    it('visits in breadth-first order', async () => {
      const result = await bfs(line, 0);
      expect(result.order[0]).toBe(0);
      expect(result.order[1]).toBe(1);
    });
  });

  describe('dfs', () => {
    it('visits all reachable nodes from root', async () => {
      const result = await dfs(line, 0);
      expect(result.order).toHaveLength(5);
      expect(result.order[0]).toBe(0);
      expect(new Set(result.order).size).toBe(5);
    });
  });

  describe('disconnected graph', () => {
    it('dijkstra returns Infinity for unreachable target', async () => {
      const result = await dijkstra(disconnected, 0, 5);
      expect(result.distance).toBe(Infinity);
    });

    it('bfs only visits reachable component', async () => {
      const result = await bfs(disconnected, 0);
      expect(result.order).toHaveLength(3);
      expect(new Set(result.order)).toEqual(new Set([0, 1, 2]));
    });

    it('dfs only visits reachable component', async () => {
      const result = await dfs(disconnected, 3);
      expect(result.order).toHaveLength(3);
      expect(new Set(result.order)).toEqual(new Set([3, 4, 5]));
    });
  });

  describe('weighted dijkstra', () => {
    it('finds shorter weighted path', async () => {
      const g = new Graph();
      g.addEdge(0, 1, { weight: 10 });
      g.addEdge(0, 2, { weight: 1 });
      g.addEdge(2, 1, { weight: 1 });
      const result = await dijkstra(g, 0, 1);
      expect(result.distance).toBe(2);
    });

    it('ignores weights when weighted=false', async () => {
      const g = new Graph();
      g.addEdge(0, 1, { weight: 100 });
      g.addEdge(0, 2, { weight: 1 });
      g.addEdge(2, 1, { weight: 1 });
      const result = await dijkstra(g, 0, 1, { weighted: false });
      expect(result.distance).toBe(1);
    });

    it('defaults unweighted edges to weight 1', async () => {
      const g = new Graph();
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      const result = await dijkstra(g, 0, 2);
      expect(result.distance).toBe(2);
    });
  });

  describe('directed graph paths', () => {
    it('dijkstra respects edge direction', async () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 2],
        ],
        { directed: true },
      );
      const forward = await dijkstra(g, 0, 2);
      expect(forward.distance).toBe(2);
      const backward = await dijkstra(g, 2, 0);
      expect(backward.distance).toBe(Infinity);
    });

    it('bfs traverses only reachable nodes in directed graph', async () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 2],
          [3, 2],
        ],
        { directed: true },
      );
      const result = await bfs(g, 0);
      expect(new Set(result.order)).toEqual(new Set([0, 1, 2]));
      expect(result.order).not.toContain(3);
    });
  });

  describe('small graph edge cases', () => {
    it('bfs starting from leaf in star graph', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [0, 2],
        [0, 3],
      ]);
      const result = await bfs(g, 1);
      expect(result.order).toHaveLength(4);
      expect(result.order[0]).toBe(1);
    });

    it('dfs visits all nodes in complete graph', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [0, 2],
        [1, 2],
      ]);
      const result = await dfs(g, 0);
      expect(result.order).toHaveLength(3);
      expect(new Set(result.order)).toEqual(new Set([0, 1, 2]));
    });

    it('bellmanFord on disconnected directed graph returns Infinity', async () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [2, 3],
        ],
        { directed: true },
      );
      const result = await bellmanFord(g, 0, 3);
      expect(result.distance).toBe(Infinity);
    });
  });

  describe('allPairsShortestPaths', () => {
    it('returns symmetric matrix for undirected graph', async () => {
      const result = await allPairsShortestPaths(line);
      expect(result).toHaveLength(5);
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          expect(result[i]![j]).toBe(result[j]![i]);
        }
      }
    });

    it('diagonal is all zeros', async () => {
      const result = await allPairsShortestPaths(line);
      for (let i = 0; i < 5; i++) {
        expect(result[i]![i]).toBe(0);
      }
    });

    it('distances match dijkstra', async () => {
      const apsp = await allPairsShortestPaths(line);
      const d = await dijkstra(line, 0, 4);
      expect(apsp[0]![4]).toBe(d.distance);
    });
  });
});
