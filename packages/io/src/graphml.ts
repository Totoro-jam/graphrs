import { getWasm, Graph } from '@graphrs/core';

export async function readGraphML(xml: string): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void xml;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function writeGraphML(graph: Graph): Promise<string> {
  const _wasm = await getWasm();
  void _wasm;
  void graph;
  throw new Error('Not yet implemented — WASM bindings pending');
}
