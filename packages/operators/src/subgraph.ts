import { Graph } from '@graphrs/core';
import { toWasmGraph, wasmGraphToGraph } from './utils.js';

export async function inducedSubgraph(graph: Graph, nodeIds: number[]): Promise<Graph> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.inducedSubgraph(new Uint32Array(nodeIds))) as {
      vcount: number;
      edges: [number, number][];
    };
    const g = Graph.fromEdges(raw.edges, { directed: graph.directed });
    for (let i = 0; i < raw.vcount; i++) {
      if (!g.hasNode(i)) g.addNode(i);
    }
    return g;
  } finally {
    wg.free();
  }
}

export async function complement(graph: Graph): Promise<Graph> {
  const wg = await toWasmGraph(graph);
  try {
    const result = wg.complement();
    try {
      return wasmGraphToGraph(result);
    } finally {
      result.free();
    }
  } finally {
    wg.free();
  }
}
