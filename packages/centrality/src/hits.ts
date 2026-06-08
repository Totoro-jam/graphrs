import { getWasm, type Graph } from '@graphrs/core';

export interface HitsResult {
  hubs: number[];
  authorities: number[];
}

export interface HitsOptions {
  iterations?: number;
  tolerance?: number;
}

export async function hits(graph: Graph, options?: HitsOptions): Promise<HitsResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
