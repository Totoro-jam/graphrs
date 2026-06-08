import { getWasm, type Graph, type LayoutResult, type Layout3DResult } from '@graphrs/core';

export interface MDSOptions {
  dimensions?: 2 | 3;
}
export interface DRLOptions {
  iterations?: number;
}

export async function layoutMDS(
  graph: Graph,
  options?: MDSOptions,
): Promise<LayoutResult | Layout3DResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function layoutDRL(graph: Graph, options?: DRLOptions): Promise<LayoutResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
