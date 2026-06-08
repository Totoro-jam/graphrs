import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import { dijkstra, bellmanFord, bfs, dfs, allPairsShortestPaths } from '../index.js';

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
]);

const fns = [
  ['dijkstra', dijkstra],
  ['bellmanFord', bellmanFord],
  ['bfs', bfs],
  ['dfs', dfs],
  ['allPairsShortestPaths', allPairsShortestPaths],
] as const;

describe('@graphrs/path', () => {
  it.each(fns)('%s is a function', (_, fn) => {
    expect(typeof fn).toBe('function');
  });

  it.each(fns)('%s returns a promise', (_, fn) => {
    const result = fn(graph).catch(() => {});
    expect(result).toBeInstanceOf(Promise);
  });

  it.each(fns)('%s rejects when called (WASM not available)', async (_, fn) => {
    await expect(fn(graph)).rejects.toThrow();
  });
});
