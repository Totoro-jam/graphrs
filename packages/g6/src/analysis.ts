import {
  louvain,
  leiden,
  infomap,
  labelPropagation,
  walktrap,
  fastGreedy,
} from '@graphrs/community';
import { pagerank, betweenness, closeness, eigenvector } from '@graphrs/centrality';
import { g6ToGraph } from './adapters.js';
import type {
  G6GraphData,
  CommunityMapping,
  CommunityAlgorithm,
  CentralityMapping,
  CentralityAlgorithm,
} from './types.js';

/**
 * Run community detection on G6 graph data and return a mapping
 * of node ids to community indices.
 */
export async function detectCommunities(
  data: G6GraphData,
  algorithm?: CommunityAlgorithm,
): Promise<CommunityMapping> {
  const { graph, indexToId } = g6ToGraph(data);
  const algo = algorithm ?? 'louvain';

  const result = await runCommunityAlgorithm(graph, algo);

  const communities = new Map<string, number>();
  const nodeIds = graph.nodes();
  for (let i = 0; i < nodeIds.length; i++) {
    const nodeId = nodeIds[i];
    const membership = result.membership[i];
    if (nodeId !== undefined && membership !== undefined) {
      const g6Id = indexToId.get(nodeId) ?? String(nodeId);
      communities.set(g6Id, membership);
    }
  }

  return {
    communities,
    modularity: result.modularity,
    clusterCount: result.clusters,
  };
}

async function runCommunityAlgorithm(
  graph: import('@graphrs/core').Graph,
  algorithm: CommunityAlgorithm,
): Promise<import('@graphrs/core').CommunityResult> {
  switch (algorithm) {
    case 'louvain':
      return louvain(graph);
    case 'leiden':
      return leiden(graph);
    case 'infomap':
      return infomap(graph);
    case 'label-propagation':
      return labelPropagation(graph);
    case 'walktrap':
      return walktrap(graph);
    case 'fast-greedy':
      return fastGreedy(graph);
  }
}

/**
 * Compute centrality scores on G6 graph data and return a mapping
 * of node ids to scores.
 */
export async function computeCentrality(
  data: G6GraphData,
  algorithm?: CentralityAlgorithm,
): Promise<CentralityMapping> {
  const { graph, indexToId } = g6ToGraph(data);
  const algo = algorithm ?? 'pagerank';

  const result = await runCentralityAlgorithm(graph, algo);

  const scores = new Map<string, number>();
  const nodeIds = graph.nodes();
  for (let i = 0; i < nodeIds.length; i++) {
    const nodeId = nodeIds[i];
    const score = result.scores[i];
    if (nodeId !== undefined && score !== undefined) {
      const g6Id = indexToId.get(nodeId) ?? String(nodeId);
      scores.set(g6Id, score);
    }
  }

  return { scores };
}

async function runCentralityAlgorithm(
  graph: import('@graphrs/core').Graph,
  algorithm: CentralityAlgorithm,
): Promise<import('@graphrs/core').CentralityResult> {
  switch (algorithm) {
    case 'pagerank':
      return pagerank(graph);
    case 'betweenness':
      return betweenness(graph);
    case 'closeness':
      return closeness(graph);
    case 'eigenvector':
      return eigenvector(graph);
  }
}
