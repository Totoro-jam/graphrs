import { getWasm, type Graph, type PathResult } from '@graphrs/core';

export async function bellmanFord(
  graph: Graph,
  source: number,
  target: number,
): Promise<PathResult> {
  const _wasm = await getWasm();
  void _wasm;
  void source;
  void target;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
