import type { Graph, PathResult } from '@graphrs/core';
import { toWasmGraph, getWeightsArray } from './utils.js';

export async function bellmanFord(
  graph: Graph,
  source: number,
  target: number,
): Promise<PathResult> {
  const wg = await toWasmGraph(graph);
  try {
    const weights = getWeightsArray(graph);
    const raw = JSON.parse(wg.bellmanFordDistances(source, weights)) as {
      distances: number[];
    };

    const distance = raw.distances[target] ?? Infinity;
    return { path: [], distance };
  } finally {
    wg.free();
  }
}
