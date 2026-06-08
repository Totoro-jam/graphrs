import type { Graph, CentralityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface EigenvectorOptions {
  scale?: boolean;
}

export async function eigenvector(
  graph: Graph,
  _options?: EigenvectorOptions,
): Promise<CentralityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.eigenvectorCentrality()) as { scores: number[] };
    return { scores: raw.scores };
  } finally {
    wg.free();
  }
}
