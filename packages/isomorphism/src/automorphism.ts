import type { Graph } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export async function automorphismGroupSize(graph: Graph): Promise<number> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.countAutomorphisms()) as { count: number };
    return raw.count;
  } finally {
    wg.free();
  }
}
