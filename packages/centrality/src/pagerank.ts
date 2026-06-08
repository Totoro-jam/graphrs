import { getWasm, type Graph, type CentralityResult } from '@graphrs/core';

export interface PagerankOptions {
  damping?: number;
  iterations?: number;
  tolerance?: number;
}

export async function pagerank(graph: Graph, options?: PagerankOptions): Promise<CentralityResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
