import { getWasm, type Graph } from '@graphrs/core';

export async function vertexConnectivity(
  graph: Graph,
  source?: number,
  target?: number,
): Promise<number> {
  const _wasm = await getWasm();
  void _wasm;
  void source;
  void target;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function edgeConnectivity(graph: Graph): Promise<number> {
  const _wasm = await getWasm();
  void _wasm;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function isConnected(graph: Graph): Promise<boolean> {
  const _wasm = await getWasm();
  void _wasm;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
