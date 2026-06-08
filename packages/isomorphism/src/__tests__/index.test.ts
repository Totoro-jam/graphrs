import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import {
  isIsomorphic,
  subgraphIsomorphic,
  canonicalPermutation,
  automorphismGroupSize,
} from '../index.js';

const triangle = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
]);

const triangle2 = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
]);

const pathGraph = Graph.fromEdges([
  [0, 1],
  [1, 2],
]);

describe('@graphrs/isomorphism', () => {
  it('isIsomorphic returns true for identical graphs', async () => {
    const result = await isIsomorphic(triangle, triangle2);
    expect(result).toBe(true);
  });

  it('isIsomorphic returns false for different graphs', async () => {
    const result = await isIsomorphic(triangle, pathGraph);
    expect(result).toBe(false);
  });

  it('subgraphIsomorphic returns a boolean', async () => {
    const result = await subgraphIsomorphic(triangle, pathGraph);
    expect(typeof result).toBe('boolean');
  });

  it('canonicalPermutation returns an array of numbers', async () => {
    const result = await canonicalPermutation(triangle);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
    result.forEach((v) => expect(typeof v).toBe('number'));
  });

  it('automorphismGroupSize returns a number', async () => {
    const result = await automorphismGroupSize(triangle);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });
});
