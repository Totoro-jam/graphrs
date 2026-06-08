import type { Graph } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export async function canonicalPermutation(graph: Graph): Promise<number[]> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.canonicalPermutation()) as { permutation: number[] };
    return raw.permutation;
  } finally {
    wg.free();
  }
}
