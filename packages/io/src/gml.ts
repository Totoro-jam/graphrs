import { getWasm, Graph } from '@graphrs/core';

export async function readGML(text: string): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void text;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function writeGML(graph: Graph): Promise<string> {
  const _wasm = await getWasm();
  void _wasm;
  void graph;
  throw new Error('Not yet implemented — WASM bindings pending');
}
