import type { Graph, CentralityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface PagerankOptions {
  damping?: number;
  iterations?: number;
  tolerance?: number;
}

export async function pagerank(
  graph: Graph,
  _options?: PagerankOptions,
): Promise<CentralityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.pagerank()) as { scores: number[] };
    return { scores: raw.scores };
  } finally {
    wg.free();
  }
}
