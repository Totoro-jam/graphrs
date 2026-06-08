import type { Graph, CentralityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface ClosenessOptions {
  normalized?: boolean;
}

export async function closeness(
  graph: Graph,
  _options?: ClosenessOptions,
): Promise<CentralityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.closeness()) as { scores: number[] };
    return { scores: raw.scores };
  } finally {
    wg.free();
  }
}
