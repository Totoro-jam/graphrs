import { getWasm, type Graph, type CentralityResult } from '@graphrs/core';

export interface BetweennessOptions {
  directed?: boolean;
  normalized?: boolean;
}

export async function betweenness(
  graph: Graph,
  options?: BetweennessOptions,
): Promise<CentralityResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
