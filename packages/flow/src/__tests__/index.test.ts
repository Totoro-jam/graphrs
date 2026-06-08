import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import { maxFlow, minCut, vertexConnectivity, edgeConnectivity, isConnected } from '../index.js';

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
]);

const fns = [
  ['maxFlow', maxFlow],
  ['minCut', minCut],
  ['vertexConnectivity', vertexConnectivity],
  ['edgeConnectivity', edgeConnectivity],
  ['isConnected', isConnected],
] as const;

describe('@graphrs/flow', () => {
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
