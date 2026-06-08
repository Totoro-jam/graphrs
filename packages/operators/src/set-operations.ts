import { getWasm, Graph } from '@graphrs/core';

export async function union(g1: Graph, g2: Graph): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void g1;
  void g2;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function intersection(g1: Graph, g2: Graph): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void g1;
  void g2;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function difference(g1: Graph, g2: Graph): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void g1;
  void g2;
  throw new Error('Not yet implemented — WASM bindings pending');
}
