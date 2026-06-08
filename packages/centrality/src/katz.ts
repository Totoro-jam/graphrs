import { getWasm, type Graph, type CentralityResult } from '@graphrs/core';

export interface KatzOptions {
  alpha?: number;
  beta?: number;
}

export async function katz(graph: Graph, options?: KatzOptions): Promise<CentralityResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
