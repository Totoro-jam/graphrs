import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import { pagerank, betweenness, closeness, eigenvector, hits, katz, harmonic } from '../index.js';

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
]);

const centralityFns = [
  ['pagerank', pagerank],
  ['betweenness', betweenness],
  ['closeness', closeness],
  ['eigenvector', eigenvector],
  ['katz', katz],
  ['harmonic', harmonic],
] as const;

describe('@graphrs/centrality', () => {
  it.each(centralityFns)('%s is a function', (_, fn) => {
    expect(typeof fn).toBe('function');
  });

  it('hits is a function', () => {
    expect(typeof hits).toBe('function');
  });

  it.each(centralityFns)('%s returns CentralityResult with scores', async (_, fn) => {
    const result = await fn(graph);
    expect(result).toHaveProperty('scores');
    expect(result.scores).toHaveLength(3);
    for (const s of result.scores) {
      expect(typeof s).toBe('number');
    }
  });

  it('hits returns hubs and authorities', async () => {
    const result = await hits(graph);
    expect(result).toHaveProperty('hubs');
    expect(result).toHaveProperty('authorities');
    expect(result.hubs).toHaveLength(3);
    expect(result.authorities).toHaveLength(3);
  });
});
