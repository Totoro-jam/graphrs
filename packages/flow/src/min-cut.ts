import type { Graph } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface MinCutResult {
  value: number;
  partition: [number[], number[]];
  cutEdges: [number, number][];
}

export async function minCut(graph: Graph, source: number, target: number): Promise<MinCutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.stMincut(source, target)) as {
      value: number;
      cut: number[];
      partition: number[];
    };
    const partitionSet = new Set(raw.partition);
    const allNodes = graph.nodes();
    const otherPartition = allNodes.filter((n) => !partitionSet.has(n));

    const edgePairs = graph._getEdgePairs();
    const cutEdges: [number, number][] = [];
    for (const [u, v] of edgePairs) {
      if (
        (partitionSet.has(u) && !partitionSet.has(v)) ||
        (!partitionSet.has(u) && partitionSet.has(v))
      ) {
        cutEdges.push([u, v]);
      }
    }

    return {
      value: raw.value,
      partition: [raw.partition, otherPartition],
      cutEdges,
    };
  } finally {
    wg.free();
  }
}
