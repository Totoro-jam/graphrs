import { getWasm, Graph } from '@graphrs/core';

export async function readPajek(text: string): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void text;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function writePajek(graph: Graph): Promise<string> {
  const _wasm = await getWasm();
  void _wasm;
  void graph;
  throw new Error('Not yet implemented — WASM bindings pending');
}
