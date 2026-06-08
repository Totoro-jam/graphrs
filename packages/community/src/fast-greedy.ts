import { getWasm, type Graph, type CommunityResult } from '@graphrs/core';

export async function fastGreedy(graph: Graph): Promise<CommunityResult> {
  const _wasm = await getWasm();
  void _wasm;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
