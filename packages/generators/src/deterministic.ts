import { getWasm, Graph } from '@graphrs/core';

export async function complete(n: number, directed?: boolean): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void n;
  void directed;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function ring(n: number): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void n;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function lattice(dims: number[]): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void dims;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function star(n: number, center?: number): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void n;
  void center;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function tree(n: number, children?: number): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void n;
  void children;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function path(n: number): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void n;
  throw new Error('Not yet implemented — WASM bindings pending');
}
