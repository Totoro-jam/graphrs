import type { Graph, CentralityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface KatzOptions {
  alpha?: number;
  beta?: number;
}

export async function katz(graph: Graph, _options?: KatzOptions): Promise<CentralityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.katzCentrality()) as { scores: number[] };
    return { scores: raw.scores };
  } finally {
    wg.free();
  }
}
