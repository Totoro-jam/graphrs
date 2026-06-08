import type { Graph, PathResult } from '@graphrs/core';
import { toWasmGraph, getWeightsArray } from './utils.js';

export interface DijkstraOptions {
  weighted?: boolean;
}

export async function dijkstra(
  graph: Graph,
  source: number,
  target: number,
  options?: DijkstraOptions,
): Promise<PathResult> {
  const wg = await toWasmGraph(graph);
  try {
    const weights =
      options?.weighted === false
        ? new Float64Array(graph.edgeCount()).fill(1.0)
        : getWeightsArray(graph);

    const raw = JSON.parse(wg.dijkstra(source, weights)) as {
      distances: number[];
    };

    const distance = raw.distances[target] ?? Infinity;
    return { path: [], distance };
  } finally {
    wg.free();
  }
}
