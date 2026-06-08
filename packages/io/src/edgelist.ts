import { getWasm, Graph } from '@graphrs/core';
import { toWasmGraph, wasmGraphToGraph } from './utils.js';

export async function readEdgeList(text: string, _separator?: string): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.readEdgelist(text);
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function writeEdgeList(graph: Graph, _separator?: string): Promise<string> {
  const wg = await toWasmGraph(graph);
  try {
    return wg.writeEdgelist();
  } finally {
    wg.free();
  }
}
