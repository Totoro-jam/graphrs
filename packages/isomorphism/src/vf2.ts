import { getWasm, type Graph } from '@graphrs/core';

export async function isIsomorphic(g1: Graph, g2: Graph): Promise<boolean> {
  const _wasm = await getWasm();
  void _wasm;
  void g1._getEdgePairs();
  void g2._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function subgraphIsomorphic(g1: Graph, g2: Graph): Promise<boolean> {
  const _wasm = await getWasm();
  void _wasm;
  void g1._getEdgePairs();
  void g2._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
