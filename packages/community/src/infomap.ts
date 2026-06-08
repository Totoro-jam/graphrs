import type { Graph, CommunityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface InfomapOptions {
  trials?: number;
}

export async function infomap(graph: Graph, _options?: InfomapOptions): Promise<CommunityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.infomap()) as { membership: number[]; codelength: number };
    return {
      membership: raw.membership,
      modularity: raw.codelength,
      clusters: new Set(raw.membership).size,
    };
  } finally {
    wg.free();
  }
}
