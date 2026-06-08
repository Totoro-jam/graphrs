import { getWasm, type Graph, type CentralityResult } from '@graphrs/core';

export interface EigenvectorOptions {
  scale?: boolean;
}

export async function eigenvector(
  graph: Graph,
  options?: EigenvectorOptions,
): Promise<CentralityResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
