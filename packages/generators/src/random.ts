import { getWasm, Graph } from '@graphrs/core';
import { wasmGraphToGraph } from './utils.js';

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
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.erdosRenyi(options.n, options.p, BigInt(42));
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function barabasiAlbert(options: BarabasiAlbertOptions): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.barabasiAlbert(options.n, options.m, BigInt(42));
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function wattsStrogatz(options: WattsStrogatzOptions): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.wattsStrogatz(options.n, options.k, options.p, BigInt(42));
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function stochasticBlockModel(options: SBMOptions): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const nBlocks = options.blockSizes.length;
  const flatPref: number[] = [];
  for (const row of options.prefMatrix) {
    for (const val of row) {
      flatPref.push(val);
    }
  }
  const wg = WasmGraph.sbmGame(
    new Float64Array(flatPref),
    nBlocks,
    new Uint32Array(options.blockSizes),
    false,
    42,
  );
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}
