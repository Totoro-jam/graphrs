import { getWasm, Graph } from '@graphrs/core';
import { toWasmGraph, wasmGraphToGraph } from './utils.js';

export async function readGML(text: string): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.readGml(text);
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function writeGML(graph: Graph): Promise<string> {
  const wg = await toWasmGraph(graph);
  try {
    return wg.writeGml();
  } finally {
    wg.free();
  }
}
