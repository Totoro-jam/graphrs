import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import {
  layoutFR,
  layoutKK,
  layoutCircle,
  layoutGrid,
  layoutStar,
  layoutRandom,
  layoutMDS,
} from '../index.js';

const karate = Graph.fromEdges([
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [0, 6],
  [0, 7],
  [0, 8],
  [0, 10],
  [0, 11],
  [0, 12],
  [0, 13],
  [0, 17],
  [0, 19],
  [0, 21],
  [0, 31],
  [1, 2],
  [1, 3],
  [1, 7],
  [1, 13],
  [1, 17],
  [1, 19],
  [1, 21],
  [1, 30],
  [2, 3],
  [2, 7],
  [2, 8],
  [2, 9],
  [2, 13],
  [2, 27],
  [2, 28],
  [2, 32],
  [3, 7],
  [3, 12],
  [3, 13],
  [4, 6],
  [4, 10],
  [5, 6],
  [5, 10],
  [5, 16],
  [6, 16],
  [8, 30],
  [8, 32],
  [8, 33],
  [9, 33],
  [13, 33],
  [14, 32],
  [14, 33],
  [15, 32],
  [15, 33],
  [18, 32],
  [18, 33],
  [19, 33],
  [20, 32],
  [20, 33],
  [22, 32],
  [22, 33],
  [23, 25],
  [23, 27],
  [23, 29],
  [23, 32],
  [23, 33],
  [24, 25],
  [24, 27],
  [24, 31],
  [25, 31],
  [26, 29],
  [26, 33],
  [27, 33],
  [28, 31],
  [28, 33],
  [29, 32],
  [29, 33],
  [30, 32],
  [30, 33],
  [31, 32],
  [31, 33],
  [32, 33],
]);

function expectValidLayout(result: { positions: [number, number][] }, n: number): void {
  expect(result.positions).toHaveLength(n);
  for (const [x, y] of result.positions) {
    expect(Number.isFinite(x)).toBe(true);
    expect(Number.isFinite(y)).toBe(true);
  }
}

describe('@graphrs/layout integration (Karate Club, 34 nodes)', () => {
  it('layoutFR produces non-overlapping positions', async () => {
    const result = await layoutFR(karate);
    expectValidLayout(result, 34);
    const unique = new Set(result.positions.map(([x, y]) => `${x},${y}`));
    expect(unique.size).toBe(34);
  });

  it('layoutKK produces valid positions', async () => {
    const result = await layoutKK(karate);
    expectValidLayout(result, 34);
  });

  it('layoutCircle places nodes equidistant from center', async () => {
    const result = await layoutCircle(karate);
    expectValidLayout(result, 34);
    const radii = result.positions.map(([x, y]) => Math.sqrt(x * x + y * y));
    const avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
    for (const r of radii) {
      expect(r).toBeCloseTo(avgRadius, 3);
    }
  });

  it('layoutGrid returns valid positions', async () => {
    const result = await layoutGrid(karate);
    expectValidLayout(result, 34);
  });

  it('layoutStar places center node at origin', async () => {
    const result = await layoutStar(karate);
    expectValidLayout(result, 34);
    expect(result.positions[0]![0]).toBeCloseTo(0, 5);
    expect(result.positions[0]![1]).toBeCloseTo(0, 5);
  });

  it('layoutRandom is deterministic with same seed', async () => {
    const a = await layoutRandom(karate, 42);
    const b = await layoutRandom(karate, 42);
    expect(a.positions).toEqual(b.positions);
  });

  it('layoutMDS returns valid positions', async () => {
    const result = await layoutMDS(karate);
    expectValidLayout(result, 34);
  });
});
