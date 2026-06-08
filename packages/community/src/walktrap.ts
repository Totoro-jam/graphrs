import type { Graph, CommunityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface WalktrapOptions {
  steps?: number;
}

export async function walktrap(graph: Graph, _options?: WalktrapOptions): Promise<CommunityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.walktrap()) as {
      membership: number[];
      nb_clusters: number;
      modularity: number;
    };
    return {
      membership: raw.membership,
      modularity: raw.modularity,
      clusters: raw.nb_clusters,
    };
  } finally {
    wg.free();
  }
}
