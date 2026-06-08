import { getWasm, Graph } from '@graphrs/core';

export interface ErdosRenyiOptions {
  n: number;
  p: number;
  directed?: boolean;
}
export interface BarabasiAlbertOptions {
  n: number;
  m: number;
  directed?: boolean;
}
export interface WattsStrogatzOptions {
  n: number;
  k: number;
  p: number;
}
export interface SBMOptions {
  blockSizes: number[];
  prefMatrix: number[][];
}

export async function erdosRenyi(options: ErdosRenyiOptions): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function barabasiAlbert(options: BarabasiAlbertOptions): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function wattsStrogatz(options: WattsStrogatzOptions): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  throw new Error('Not yet implemented — WASM bindings pending');
}
export async function stochasticBlockModel(options: SBMOptions): Promise<Graph> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  throw new Error('Not yet implemented — WASM bindings pending');
}
