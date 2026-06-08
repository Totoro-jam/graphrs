import { getWasm, Graph } from '@graphrs/core';

export async function inducedSubgraph(graph: Graph, nodeIds: number[]): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void graph;
  void nodeIds;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function complement(graph: Graph): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void graph;
  throw new Error('Not yet implemented — WASM bindings pending');
}
