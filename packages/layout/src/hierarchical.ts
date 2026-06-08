import { getWasm, type Graph, type LayoutResult } from '@graphrs/core';

export interface SugiyamaOptions {
  layerSpacing?: number;
  nodeSpacing?: number;
}
export interface ReingoldTilfordOptions {
  rootNode?: number;
}

export async function layoutSugiyama(
  graph: Graph,
  options?: SugiyamaOptions,
): Promise<LayoutResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function layoutReingoldTilford(
  graph: Graph,
  options?: ReingoldTilfordOptions,
): Promise<LayoutResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
