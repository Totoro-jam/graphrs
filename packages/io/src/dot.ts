import { getWasm, Graph } from '@graphrs/core';
import { toWasmGraph, wasmGraphToGraph } from './utils.js';

export async function readDOT(text: string): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.readDot(text);
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function writeDOT(graph: Graph): Promise<string> {
  const wg = await toWasmGraph(graph);
  try {
    return wg.writeDot();
  } finally {
    wg.free();
  }
}
