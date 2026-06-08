import { getWasm, type Graph, type PathResult } from '@graphrs/core';

export interface DijkstraOptions {
  weighted?: boolean;
}

export async function dijkstra(
  graph: Graph,
  source: number,
  target: number,
  options?: DijkstraOptions,
): Promise<PathResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void source;
  void target;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
