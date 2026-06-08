import type { Graph, CommunityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface LouvainOptions {
  resolution?: number;
}

export async function louvain(graph: Graph, _options?: LouvainOptions): Promise<CommunityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.louvain()) as { membership: number[]; modularity: number };
    return {
      membership: raw.membership,
      modularity: raw.modularity,
      clusters: new Set(raw.membership).size,
    };
  } finally {
    wg.free();
  }
}
