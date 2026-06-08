import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import {
  layoutFR,
  layoutKK,
  layoutGraphopt,
  layoutSugiyama,
  layoutReingoldTilford,
  layoutCircle,
  layoutGrid,
  layoutStar,
  layoutRandom,
  layoutMDS,
  layoutDRL,
} from '../index.js';

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
]);

const fns = [
  ['layoutFR', layoutFR],
  ['layoutKK', layoutKK],
  ['layoutGraphopt', layoutGraphopt],
  ['layoutSugiyama', layoutSugiyama],
  ['layoutReingoldTilford', layoutReingoldTilford],
  ['layoutCircle', layoutCircle],
  ['layoutGrid', layoutGrid],
  ['layoutStar', layoutStar],
  ['layoutRandom', layoutRandom],
  ['layoutMDS', layoutMDS],
  ['layoutDRL', layoutDRL],
] as const;

describe('@graphrs/layout', () => {
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
