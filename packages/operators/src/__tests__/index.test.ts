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

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
]);

const unaryFns = [
  ['simplify', simplify],
  ['reverse', reverse],
  ['toDirected', toDirected],
  ['toUndirected', toUndirected],
  ['complement', complement],
] as const;

const binaryFns = [
  ['union', union],
  ['intersection', intersection],
  ['difference', difference],
] as const;

describe('@graphrs/operators', () => {
  it.each(unaryFns)('%s is a function', (_, fn) => {
    expect(typeof fn).toBe('function');
  });

  it.each(binaryFns)('%s is a function', (_, fn) => {
    expect(typeof fn).toBe('function');
  });

  it('inducedSubgraph is a function', () => {
    expect(typeof inducedSubgraph).toBe('function');
  });

  it.each(unaryFns)('%s rejects when called (WASM not available)', async (_, fn) => {
    await expect(fn(graph)).rejects.toThrow();
  });

  it.each(binaryFns)('%s rejects when called (WASM not available)', async (_, fn) => {
    await expect(fn(graph, graph)).rejects.toThrow();
  });

  it('inducedSubgraph rejects when called (WASM not available)', async () => {
    await expect(inducedSubgraph(graph, [0, 1])).rejects.toThrow();
  });
});
