import type { Graph } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface BfsResult {
  order: number[];
  distances: number[];
  parents: number[];
}

export async function bfs(graph: Graph, source: number): Promise<BfsResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.bfs(source)) as {
      order: number[];
      distances?: number[];
      parents?: number[];
    };

    return {
      order: raw.order,
      distances: raw.distances ?? [],
      parents: raw.parents ?? [],
    };
  } finally {
    wg.free();
  }
}
