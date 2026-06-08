import { getWasm, Graph } from '@graphrs/core';
import { toWasmGraph, wasmGraphToGraph } from './utils.js';

export async function readPajek(text: string): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.readPajek(text);
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function writePajek(graph: Graph): Promise<string> {
  const wg = await toWasmGraph(graph);
  try {
    return wg.writePajek();
  } finally {
    wg.free();
  }
}
