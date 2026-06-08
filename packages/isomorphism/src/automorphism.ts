import { getWasm, type Graph } from '@graphrs/core';

export async function automorphismGroupSize(graph: Graph): Promise<number> {
  const _wasm = await getWasm();
  void _wasm;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
