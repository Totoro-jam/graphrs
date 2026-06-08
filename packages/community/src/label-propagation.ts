import type { Graph, CommunityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface LabelPropagationOptions {
  fixed?: number[];
}

export async function labelPropagation(
  graph: Graph,
  _options?: LabelPropagationOptions,
): Promise<CommunityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.labelPropagation()) as {
      membership: number[];
      nb_clusters: number;
    };
    return {
      membership: raw.membership,
      modularity: 0,
      clusters: raw.nb_clusters,
    };
  } finally {
    wg.free();
  }
}
