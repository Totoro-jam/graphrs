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

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
]);

const fns = [
  ['louvain', louvain],
  ['leiden', leiden],
  ['infomap', infomap],
  ['labelPropagation', labelPropagation],
  ['walktrap', walktrap],
  ['fastGreedy', fastGreedy],
  ['spinglass', spinglass],
] as const;

describe('@graphrs/community', () => {
  it.each(fns)('%s is a function', (_, fn) => {
    expect(typeof fn).toBe('function');
  });

  it('fluidCommunities is a function', () => {
    expect(typeof fluidCommunities).toBe('function');
  });

  it.each(fns)('%s returns a CommunityResult', async (_, fn) => {
    const result = await fn(graph);
    expect(result).toHaveProperty('membership');
    expect(result).toHaveProperty('modularity');
    expect(result).toHaveProperty('clusters');
    expect(result.membership).toHaveLength(3);
  });

  it('fluidCommunities returns a CommunityResult', async () => {
    const result = await fluidCommunities(graph, { numCommunities: 2 });
    expect(result).toHaveProperty('membership');
    expect(result).toHaveProperty('modularity');
    expect(result).toHaveProperty('clusters');
    expect(result.membership).toHaveLength(3);
  });
});
