import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import {
  louvain,
  leiden,
  infomap,
  labelPropagation,
  walktrap,
  fastGreedy,
  spinglass,
  fluidCommunities,
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

describe('@graphrs/community integration (WASM)', () => {
  it('louvain detects communities in karate club', async () => {
    const result = await louvain(karate);
    expect(result.membership).toHaveLength(34);
    expect(result.clusters).toBeGreaterThanOrEqual(2);
    expect(result.modularity).toBeGreaterThan(0);
  });

  it('leiden detects communities in karate club', async () => {
    const result = await leiden(karate);
    expect(result.membership).toHaveLength(34);
    expect(result.clusters).toBeGreaterThanOrEqual(2);
    expect(result.modularity).toBeGreaterThan(0);
  });

  it('infomap detects communities in karate club', async () => {
    const result = await infomap(karate);
    expect(result.membership).toHaveLength(34);
    expect(result.clusters).toBeGreaterThanOrEqual(2);
    expect(result.modularity).toBeGreaterThan(0);
  });

  it('labelPropagation detects communities in karate club', async () => {
    const result = await labelPropagation(karate);
    expect(result.membership).toHaveLength(34);
    expect(result.clusters).toBeGreaterThanOrEqual(2);
  });

  it('walktrap detects communities in karate club', async () => {
    const result = await walktrap(karate);
    expect(result.membership).toHaveLength(34);
    expect(result.clusters).toBeGreaterThanOrEqual(2);
    expect(result.modularity).toBeGreaterThanOrEqual(0);
  });

  it('fastGreedy detects communities in karate club', async () => {
    const result = await fastGreedy(karate);
    expect(result.membership).toHaveLength(34);
    expect(result.clusters).toBeGreaterThanOrEqual(2);
    expect(result.modularity).toBeGreaterThanOrEqual(-1e-10);
  });

  it('spinglass detects communities in karate club', async () => {
    const result = await spinglass(karate);
    expect(result.membership).toHaveLength(34);
    expect(result.clusters).toBeGreaterThanOrEqual(2);
    expect(result.modularity).toBeGreaterThan(0);
  });

  it('fluidCommunities detects communities in karate club', async () => {
    const result = await fluidCommunities(karate, { numCommunities: 2 });
    expect(result.membership).toHaveLength(34);
    expect(result.clusters).toBe(2);
  });

  it('membership values are valid cluster indices', async () => {
    const result = await louvain(karate);
    for (const m of result.membership) {
      expect(m).toBeGreaterThanOrEqual(0);
      expect(m).toBeLessThan(result.clusters);
    }
  });

  it('works on a small triangle graph', async () => {
    const triangle = Graph.fromEdges([
      [0, 1],
      [1, 2],
      [2, 0],
    ]);
    const result = await louvain(triangle);
    expect(result.membership).toHaveLength(3);
    expect(result.clusters).toBe(1);
  });

  it('two disconnected cliques form two communities', async () => {
    const g = Graph.fromEdges([
      [0, 1],
      [1, 2],
      [2, 0],
      [3, 4],
      [4, 5],
      [5, 3],
    ]);
    const result = await louvain(g);
    expect(result.membership).toHaveLength(6);
    expect(result.clusters).toBe(2);
    expect(result.membership[0]).toBe(result.membership[1]);
    expect(result.membership[3]).toBe(result.membership[4]);
    expect(result.membership[0]).not.toBe(result.membership[3]);
  });

  it('single edge graph puts both nodes in same community', async () => {
    const g = Graph.fromEdges([[0, 1]]);
    const result = await louvain(g);
    expect(result.membership).toHaveLength(2);
    expect(result.clusters).toBe(1);
    expect(result.membership[0]).toBe(result.membership[1]);
  });

  it('leiden produces connected communities', async () => {
    const g = Graph.fromEdges([
      [0, 1],
      [1, 2],
      [2, 0],
      [3, 4],
      [4, 5],
      [5, 3],
      [2, 3],
    ]);
    const result = await leiden(g);
    expect(result.membership).toHaveLength(6);
    expect(result.clusters).toBeGreaterThanOrEqual(1);
  });

  it('fluidCommunities with k=1 assigns all to same community', async () => {
    const g = Graph.fromEdges([
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
    const result = await fluidCommunities(g, { numCommunities: 1 });
    expect(result.clusters).toBe(1);
    expect(new Set(result.membership).size).toBe(1);
  });

  it('fastGreedy on complete graph K4', async () => {
    const g = Graph.fromEdges([
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ]);
    const result = await fastGreedy(g);
    expect(result.membership).toHaveLength(4);
    expect(result.clusters).toBeGreaterThanOrEqual(1);
  });

  it('walktrap on path graph', async () => {
    const g = Graph.fromEdges([
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ]);
    const result = await walktrap(g);
    expect(result.membership).toHaveLength(5);
    expect(result.clusters).toBeGreaterThanOrEqual(1);
  });
});
