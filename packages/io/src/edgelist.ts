import { getWasm, Graph } from '@graphrs/core';

export async function readEdgeList(text: string, separator?: string): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void text;
  void separator;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function writeEdgeList(graph: Graph, separator?: string): Promise<string> {
  const _wasm = await getWasm();
  void _wasm;
  void graph;
  void separator;
  throw new Error('Not yet implemented — WASM bindings pending');
}
