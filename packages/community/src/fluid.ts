import type { Graph, CommunityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface FluidOptions {
  numCommunities: number;
}

export async function fluidCommunities(
  graph: Graph,
  options: FluidOptions,
): Promise<CommunityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.fluidCommunities(options.numCommunities)) as {
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
