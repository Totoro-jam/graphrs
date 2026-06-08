import { getWasm, type Graph, type CommunityResult } from '@graphrs/core';

export interface InfomapOptions {
  trials?: number;
}

export async function infomap(graph: Graph, options?: InfomapOptions): Promise<CommunityResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
