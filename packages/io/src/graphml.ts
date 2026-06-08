import { getWasm, Graph } from '@graphrs/core';
import { toWasmGraph, wasmGraphToGraph } from './utils.js';

export async function readGraphML(xml: string): Promise<Graph> {
  const { WasmGraph } = await getWasm();
  const wg = WasmGraph.readGraphml(xml);
  try {
    return wasmGraphToGraph(wg);
  } finally {
    wg.free();
  }
}

export async function writeGraphML(graph: Graph): Promise<string> {
  const wg = await toWasmGraph(graph);
  try {
    return wg.writeGraphml();
  } finally {
    wg.free();
  }
}
