import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import { pagerank, betweenness, closeness, eigenvector, hits, katz, harmonic } from '../index.js';

const karate = Graph.fromEdges([
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
  [0, 10], [0, 11], [0, 12], [0, 13], [0, 17], [0, 19], [0, 21], [0, 31],
  [1, 2], [1, 3], [1, 7], [1, 13], [1, 17], [1, 19], [1, 21], [1, 30],
  [2, 3], [2, 7], [2, 8], [2, 9], [2, 13], [2, 27], [2, 28], [2, 32],
  [3, 7], [3, 12], [3, 13],
  [4, 6], [4, 10],
  [5, 6], [5, 10], [5, 16],
  [6, 16],
  [8, 30], [8, 32], [8, 33],
  [9, 33],
  [13, 33],
  [14, 32], [14, 33],
  [15, 32], [15, 33],
  [18, 32], [18, 33],
  [19, 33],
  [20, 32], [20, 33],
  [22, 32], [22, 33],
  [23, 25], [23, 27], [23, 29], [23, 32], [23, 33],
  [24, 25], [24, 27], [24, 31],
  [25, 31],
  [26, 29], [26, 33],
  [27, 33],
  [28, 31], [28, 33],
  [29, 32], [29, 33],
  [30, 32], [30, 33],
  [31, 32], [31, 33],
  [32, 33],
]);

describe('@graphrs/centrality integration (Karate Club)', () => {
  it('pagerank: node 33 has highest score', async () => {
    const result = await pagerank(karate);
    expect(result.scores).toHaveLength(34);
    const maxIdx = result.scores.indexOf(Math.max(...result.scores));
    expect(maxIdx).toBe(33);
  });

  it('pagerank: scores sum to approximately 1', async () => {
    const result = await pagerank(karate);
    const sum = result.scores.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 1);
  });

  it('betweenness: high-degree nodes rank high', async () => {
    const result = await betweenness(karate);
    expect(result.scores).toHaveLength(34);
    const sorted = result.scores
      .map((s, i) => ({ score: s, node: i }))
      .sort((a, b) => b.score - a.score);
    const top5 = sorted.slice(0, 5).map((x) => x.node);
    expect(top5).toContain(0);
    expect(top5).toContain(33);
  });

  it('closeness: all scores are positive', async () => {
    const result = await closeness(karate);
    expect(result.scores).toHaveLength(34);
    for (const s of result.scores) {
      expect(s).toBeGreaterThan(0);
    }
  });

  it('eigenvector: scores are non-negative', async () => {
    const result = await eigenvector(karate);
    expect(result.scores).toHaveLength(34);
    for (const s of result.scores) {
      expect(s).toBeGreaterThanOrEqual(0);
    }
  });

  it('hits: hubs and authorities have correct length', async () => {
    const result = await hits(karate);
    expect(result.hubs).toHaveLength(34);
    expect(result.authorities).toHaveLength(34);
  });

  it('katz: all scores are positive', async () => {
    const result = await katz(karate);
    expect(result.scores).toHaveLength(34);
    for (const s of result.scores) {
      expect(s).toBeGreaterThan(0);
    }
  });

  it('harmonic: all scores are positive', async () => {
    const result = await harmonic(karate);
    expect(result.scores).toHaveLength(34);
    for (const s of result.scores) {
      expect(s).toBeGreaterThan(0);
    }
  });
});
