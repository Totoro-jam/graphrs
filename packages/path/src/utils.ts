import type { Graph, WasmGraphInstance } from '@graphrs/core';
import { getWasm } from '@graphrs/core';

export async function toWasmGraph(graph: Graph): Promise<WasmGraphInstance> {
  const { WasmGraph } = await getWasm();
  const edges = graph._getEdgePairs();
  const flat = new Uint32Array(edges.length * 2);
  for (let i = 0; i < edges.length; i++) {
    flat[i * 2] = edges[i]![0];
    flat[i * 2 + 1] = edges[i]![1];
  }
  return WasmGraph.fromEdges(flat, graph.directed);
}

export function getWeightsArray(graph: Graph): Float64Array {
  const weights = graph._getWeights();
  if (weights) {
    return new Float64Array(weights);
  }
  return new Float64Array(graph.edgeCount()).fill(1.0);
}
