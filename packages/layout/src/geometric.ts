import { getWasm, type Graph, type LayoutResult } from '@graphrs/core';

export async function layoutCircle(graph: Graph): Promise<LayoutResult> {
  const _wasm = await getWasm();
  void _wasm;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function layoutGrid(graph: Graph): Promise<LayoutResult> {
  const _wasm = await getWasm();
  void _wasm;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function layoutStar(graph: Graph, center?: number): Promise<LayoutResult> {
  const _wasm = await getWasm();
  void _wasm;
  void center;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function layoutRandom(graph: Graph, seed?: number): Promise<LayoutResult> {
  const _wasm = await getWasm();
  void _wasm;
  void seed;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
