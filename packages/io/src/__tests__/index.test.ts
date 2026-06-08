import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import {
  readGraphML,
  writeGraphML,
  readGML,
  writeGML,
  readDOT,
  writeDOT,
  readEdgeList,
  writeEdgeList,
  readPajek,
  writePajek,
} from '../index.js';

const graph = Graph.fromEdges([[0, 1], [1, 2]]);

const readers = [
  ['readGraphML', readGraphML],
  ['readGML', readGML],
  ['readDOT', readDOT],
  ['readEdgeList', readEdgeList],
  ['readPajek', readPajek],
] as const;

const writers = [
  ['writeGraphML', writeGraphML],
  ['writeGML', writeGML],
  ['writeDOT', writeDOT],
  ['writeEdgeList', writeEdgeList],
  ['writePajek', writePajek],
] as const;

describe('@graphrs/io', () => {
  it.each(readers)('%s is a function', (_, fn) => {
    expect(typeof fn).toBe('function');
  });

  it.each(writers)('%s is a function', (_, fn) => {
    expect(typeof fn).toBe('function');
  });

  it.each(readers)('%s rejects when called (WASM not available)', async (_, fn) => {
    await expect(fn('' as never)).rejects.toThrow();
  });

  it.each(writers)('%s rejects when called (WASM not available)', async (_, fn) => {
    await expect(fn(graph)).rejects.toThrow();
  });
});
