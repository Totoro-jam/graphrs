import type { Graph, CommunityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface SpinglassOptions {
  spins?: number;
  gamma?: number;
}

export async function spinglass(
  graph: Graph,
  _options?: SpinglassOptions,
): Promise<CommunityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.spinglass()) as {
      membership: number[];
      modularity: number;
      nb_clusters: number;
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
