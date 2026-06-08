import { getWasm, type Graph } from '@graphrs/core';

export interface DfsResult {
  order: number[];
  parents: number[];
}

export async function dfs(graph: Graph, source: number): Promise<DfsResult> {
  const _wasm = await getWasm();
  void _wasm;
  void source;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
