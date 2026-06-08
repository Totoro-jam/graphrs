import { getWasm, type Graph } from '@graphrs/core';

export interface BfsResult {
  order: number[];
  distances: number[];
  parents: number[];
}

export async function bfs(graph: Graph, source: number): Promise<BfsResult> {
  const _wasm = await getWasm();
  void _wasm;
  void source;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
