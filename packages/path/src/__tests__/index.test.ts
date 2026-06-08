import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import { dijkstra, bellmanFord, bfs, dfs, allPairsShortestPaths } from '../index.js';

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
]);

describe('@graphrs/path', () => {
  describe('dijkstra', () => {
    it('returns a PathResult with path and distance', async () => {
      const result = await dijkstra(graph, 0, 2);
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('distance');
      expect(Array.isArray(result.path)).toBe(true);
      expect(typeof result.distance).toBe('number');
      expect(Number.isFinite(result.distance)).toBe(true);
    });
  });

  describe('bellmanFord', () => {
    it('returns a PathResult with distance', async () => {
      const result = await bellmanFord(graph, 0, 2);
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('distance');
      expect(typeof result.distance).toBe('number');
      expect(Number.isFinite(result.distance)).toBe(true);
    });
  });

  describe('bfs', () => {
    it('returns BfsResult with order', async () => {
      const result = await bfs(graph, 0);
      expect(result).toHaveProperty('order');
      expect(Array.isArray(result.order)).toBe(true);
      expect(result.order.length).toBeGreaterThan(0);
      expect(result.order[0]).toBe(0);
    });
  });

  describe('dfs', () => {
    it('returns DfsResult with order', async () => {
      const result = await dfs(graph, 0);
      expect(result).toHaveProperty('order');
      expect(Array.isArray(result.order)).toBe(true);
      expect(result.order.length).toBeGreaterThan(0);
      expect(result.order[0]).toBe(0);
    });
  });

  describe('allPairsShortestPaths', () => {
    it('returns a 2D distance matrix', async () => {
      const result = await allPairsShortestPaths(graph);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      for (const row of result) {
        expect(row).toHaveLength(3);
      }
      expect(result[0]![0]).toBe(0);
      expect(result[1]![1]).toBe(0);
      expect(result[2]![2]).toBe(0);
    });
  });
});
