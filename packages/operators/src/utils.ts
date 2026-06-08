import type { Graph as GraphType, WasmGraphInstance } from '@graphrs/core';
import { getWasm, Graph } from '@graphrs/core';

export async function toWasmGraph(graph: GraphType): Promise<WasmGraphInstance> {
  const { WasmGraph } = await getWasm();
  const edges = graph._getEdgePairs();
  const flat = new Uint32Array(edges.length * 2);
  for (let i = 0; i < edges.length; i++) {
    flat[i * 2] = edges[i]![0];
    flat[i * 2 + 1] = edges[i]![1];
  }
  return WasmGraph.fromEdges(flat, graph.directed);
}

export function wasmGraphToGraph(wg: WasmGraphInstance): GraphType {
  const edgesFlat = wg.getEdges();
  const pairs: [number, number][] = [];
  for (let i = 0; i < edgesFlat.length; i += 2) {
    pairs.push([edgesFlat[i]!, edgesFlat[i + 1]!]);
  }
  const g = Graph.fromEdges(pairs, { directed: wg.isDirected() });
  const vcount = wg.vcount();
  for (let i = 0; i < vcount; i++) {
    if (!g.hasNode(i)) g.addNode(i);
  }
  return g;
}
