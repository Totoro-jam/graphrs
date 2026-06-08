import { getWasm, type Graph, type LayoutResult } from '@graphrs/core';

export interface FROptions {
  iterations?: number;
  cooling?: number;
}
export interface KKOptions {
  maxIterations?: number;
}
export interface GraphoptOptions {
  iterations?: number;
  charge?: number;
}

export async function layoutFR(graph: Graph, options?: FROptions): Promise<LayoutResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function layoutKK(graph: Graph, options?: KKOptions): Promise<LayoutResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function layoutGraphopt(
  graph: Graph,
  options?: GraphoptOptions,
): Promise<LayoutResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
