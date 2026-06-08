import type { Graph } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface HitsResult {
  hubs: number[];
  authorities: number[];
}

export interface HitsOptions {
  iterations?: number;
  tolerance?: number;
}

export async function hits(graph: Graph, _options?: HitsOptions): Promise<HitsResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.hubAndAuthorityScores()) as {
      hub: number[];
      authority: number[];
    };
    return { hubs: raw.hub, authorities: raw.authority };
  } finally {
    wg.free();
  }
}
