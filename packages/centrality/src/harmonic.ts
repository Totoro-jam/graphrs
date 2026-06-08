import { getWasm, type Graph, type CentralityResult } from '@graphrs/core';

export interface HarmonicOptions {
  normalized?: boolean;
}

export async function harmonic(graph: Graph, options?: HarmonicOptions): Promise<CentralityResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
