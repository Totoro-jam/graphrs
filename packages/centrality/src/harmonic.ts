import type { Graph, CentralityResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface HarmonicOptions {
  normalized?: boolean;
}

export async function harmonic(
  graph: Graph,
  _options?: HarmonicOptions,
): Promise<CentralityResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.harmonicCentrality()) as { scores: number[] };
    return { scores: raw.scores };
  } finally {
    wg.free();
  }
}
