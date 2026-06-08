import { Graph } from '@graphrs/core';
import { toWasmGraph, wasmGraphToGraph } from './utils.js';

export async function simplify(graph: Graph): Promise<Graph> {
  const wg = await toWasmGraph(graph);
  try {
    const result = wg.simplify();
    try {
      return wasmGraphToGraph(result);
    } finally {
      result.free();
    }
  } finally {
    wg.free();
  }
}

export async function reverse(graph: Graph): Promise<Graph> {
  const wg = await toWasmGraph(graph);
  try {
    const result = wg.reverse();
    try {
      return wasmGraphToGraph(result);
    } finally {
      result.free();
    }
  } finally {
    wg.free();
  }
}

export async function toDirected(graph: Graph): Promise<Graph> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.toDirected('mutual')) as {
      vcount: number;
      edges: [number, number][];
    };
    const g = Graph.fromEdges(raw.edges, { directed: true });
    for (let i = 0; i < raw.vcount; i++) {
      if (!g.hasNode(i)) g.addNode(i);
    }
    return g;
  } finally {
    wg.free();
  }
}

export async function toUndirected(graph: Graph): Promise<Graph> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.toUndirected('collapse')) as {
      vcount: number;
      edges: [number, number][];
    };
    const g = Graph.fromEdges(raw.edges, { directed: false });
    for (let i = 0; i < raw.vcount; i++) {
      if (!g.hasNode(i)) g.addNode(i);
    }
    return g;
  } finally {
    wg.free();
  }
}
