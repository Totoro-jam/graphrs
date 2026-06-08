import type { Graph } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface AllPairsOptions {
  weighted?: boolean;
}

export async function allPairsShortestPaths(
  graph: Graph,
  _options?: AllPairsOptions,
): Promise<number[][]> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.floydWarshallDistances()) as {
      matrix: number[][];
    };

    return raw.matrix;
  } finally {
    wg.free();
  }
}
