import { getWasm, type Graph } from '@graphrs/core';

export interface AllPairsOptions {
  weighted?: boolean;
}

export async function allPairsShortestPaths(
  graph: Graph,
  options?: AllPairsOptions,
): Promise<number[][]> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
