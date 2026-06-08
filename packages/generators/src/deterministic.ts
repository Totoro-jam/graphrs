import { getWasm, Graph } from '@graphrs/core';
import { wasmGraphToGraph } from './utils.js';

export async function complete(n: number, directed?: boolean): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.fullGraph(n);
  try {
    const g = wasmGraphToGraph(wg);
    if (directed) {
      return Graph.fromEdges(g._getEdgePairs(), { directed: true });
    }
    return g;
  } finally {
    wg.free();
  }
}

export async function ring(n: number): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.ringGraph(n, true);
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function lattice(dims: number[]): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.squareLattice(new Uint32Array(dims), 1, false, false);
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function star(n: number, _center?: number): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.starGraph(n);
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function tree(n: number, children?: number): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.karyTree(n, children ?? 2, 'undirected');
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function path(n: number): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.pathGraph(n, false);
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}
