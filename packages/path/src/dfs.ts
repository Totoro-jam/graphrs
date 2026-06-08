import type { Graph } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface DfsResult {
  order: number[];
  parents: number[];
}

export async function dfs(graph: Graph, source: number): Promise<DfsResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.dfs(source)) as {
      order: number[];
      parents?: number[];
    };

    return {
      order: raw.order,
      parents: raw.parents ?? [],
    };
  } finally {
    wg.free();
  }
}
