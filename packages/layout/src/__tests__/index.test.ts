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

function expectValidLayout(result: { positions: [number, number][] }, nodeCount: number): void {
  expect(result.positions).toHaveLength(nodeCount);
  for (const pos of result.positions) {
    expect(pos).toHaveLength(2);
    expect(typeof pos[0]).toBe('number');
    expect(typeof pos[1]).toBe('number');
    expect(Number.isFinite(pos[0])).toBe(true);
    expect(Number.isFinite(pos[1])).toBe(true);
  }
}

describe('@graphrs/layout', () => {
  it('layoutFR returns valid positions', async () => {
    const result = await layoutFR(graph);
    expectValidLayout(result, 3);
  });

  it('layoutFR accepts iterations option', async () => {
    const result = await layoutFR(graph, { iterations: 100 });
    expectValidLayout(result, 3);
  });

  it('layoutKK returns valid positions', async () => {
    const result = await layoutKK(graph);
    expectValidLayout(result, 3);
  });

  it('layoutGraphopt returns valid positions', async () => {
    const result = await layoutGraphopt(graph);
    expectValidLayout(result, 3);
  });

  it('layoutSugiyama returns valid positions', async () => {
    const result = await layoutSugiyama(graph);
    expectValidLayout(result, 3);
  });

  it('layoutReingoldTilford returns valid positions', async () => {
    const result = await layoutReingoldTilford(graph);
    expectValidLayout(result, 3);
  });

  it('layoutReingoldTilford accepts rootNode option', async () => {
    const result = await layoutReingoldTilford(graph, { rootNode: 1 });
    expectValidLayout(result, 3);
  });

  it('layoutCircle returns valid positions', async () => {
    const result = await layoutCircle(graph);
    expectValidLayout(result, 3);
  });

  it('layoutGrid returns valid positions', async () => {
    const result = await layoutGrid(graph);
    expectValidLayout(result, 3);
  });

  it('layoutStar returns valid positions', async () => {
    const result = await layoutStar(graph);
    expectValidLayout(result, 3);
  });

  it('layoutRandom returns valid positions', async () => {
    const result = await layoutRandom(graph);
    expectValidLayout(result, 3);
  });

  it('layoutRandom is deterministic with same seed', async () => {
    const a = await layoutRandom(graph, 42);
    const b = await layoutRandom(graph, 42);
    expect(a.positions).toEqual(b.positions);
  });

  it('layoutMDS returns valid positions', async () => {
    const result = await layoutMDS(graph);
    expectValidLayout(result, 3);
  });

  it('layoutDRL returns valid positions', async () => {
    const result = await layoutDRL(graph);
    expectValidLayout(result, 3);
  });
});
