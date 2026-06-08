import type { Graph, CommunityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface LeidenOptions {
  resolution?: number;
  beta?: number;
  iterations?: number;
}

export async function leiden(graph: Graph, _options?: LeidenOptions): Promise<CommunityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.leiden()) as {
      membership: number[];
      quality: number;
      nb_clusters: number;
    };
    return {
      membership: raw.membership,
      modularity: raw.quality,
      clusters: raw.nb_clusters,
    };
  } finally {
    wg.free();
  }
}
