import type { Graph, CentralityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface BetweennessOptions {
  directed?: boolean;
  normalized?: boolean;
}

export async function betweenness(
  graph: Graph,
  _options?: BetweennessOptions,
): Promise<CentralityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.betweenness()) as { scores: number[] };
    return { scores: raw.scores };
  } finally {
    wg.free();
  }
}
