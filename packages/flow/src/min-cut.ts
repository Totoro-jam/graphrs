import { getWasm, type Graph } from '@graphrs/core';

export interface MinCutResult {
  value: number;
  partition: [number[], number[]];
  cutEdges: [number, number][];
}

export async function minCut(graph: Graph, source: number, target: number): Promise<MinCutResult> {
  const _wasm = await getWasm();
  void _wasm;
  void source;
  void target;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
