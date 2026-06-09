import { describe, it, expect } from 'vitest';
import { detectCommunities, computeCentrality } from '../analysis.js';
import type { G6GraphData } from '../types.js';

const sampleData: G6GraphData = {
  nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
  edges: [
    { source: 'a', target: 'b' },
    { source: 'b', target: 'c' },
    { source: 'c', target: 'd' },
    { source: 'd', target: 'a' },
  ],
};

describe('detectCommunities', () => {
  it('should return a CommunityMapping with communities map', async () => {
    const result = await detectCommunities(sampleData);
    expect(result.communities).toBeInstanceOf(Map);
    expect(result.communities.size).toBe(4);
    expect(typeof result.modularity).toBe('number');
    expect(typeof result.clusterCount).toBe('number');
    expect(result.clusterCount).toBeGreaterThan(0);
  });

  it('should assign community labels to all nodes', async () => {
    const result = await detectCommunities(sampleData, 'louvain');
    for (const nodeId of ['a', 'b', 'c', 'd']) {
      expect(result.communities.has(nodeId)).toBe(true);
      expect(typeof result.communities.get(nodeId)).toBe('number');
    }
  });

  it('should work with leiden algorithm', async () => {
    const result = await detectCommunities(sampleData, 'leiden');
    expect(result.communities.size).toBe(4);
    expect(result.clusterCount).toBeGreaterThan(0);
  });

  it('should work with label-propagation algorithm', async () => {
    const result = await detectCommunities(sampleData, 'label-propagation');
    expect(result.communities.size).toBe(4);
  });

  it('should work with all supported algorithms', async () => {
    const algorithms = [
      'louvain',
      'leiden',
      'infomap',
      'label-propagation',
      'walktrap',
      'fast-greedy',
    ] as const;
    for (const algo of algorithms) {
      const result = await detectCommunities(sampleData, algo);
      expect(result.communities.size).toBe(4);
    }
  });
});

describe('computeCentrality', () => {
  it('should return a CentralityMapping with scores map', async () => {
    const result = await computeCentrality(sampleData);
    expect(result.scores).toBeInstanceOf(Map);
    expect(result.scores.size).toBe(4);
  });

  it('should assign numeric scores to all nodes', async () => {
    const result = await computeCentrality(sampleData, 'pagerank');
    for (const nodeId of ['a', 'b', 'c', 'd']) {
      expect(result.scores.has(nodeId)).toBe(true);
      expect(typeof result.scores.get(nodeId)).toBe('number');
      expect(result.scores.get(nodeId)!).toBeGreaterThanOrEqual(0);
    }
  });

  it('should work with betweenness centrality', async () => {
    const result = await computeCentrality(sampleData, 'betweenness');
    expect(result.scores.size).toBe(4);
  });

  it('should work with all supported algorithms', async () => {
    const algorithms = ['pagerank', 'betweenness', 'closeness', 'eigenvector'] as const;
    for (const algo of algorithms) {
      const result = await computeCentrality(sampleData, algo);
      expect(result.scores.size).toBe(4);
    }
  });
});
