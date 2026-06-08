import type { Graph } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export async function vertexConnectivity(
  graph: Graph,
  _source?: number,
  _target?: number,
): Promise<number> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.vertexConnectivity()) as { value: number };
    return raw.value;
  } finally {
    wg.free();
  }
}

export async function edgeConnectivity(graph: Graph): Promise<number> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.edgeConnectivity()) as { value: number };
    return raw.value;
  } finally {
    wg.free();
  }
}

export async function isConnected(graph: Graph): Promise<boolean> {
  const wg = await toWasmGraph(graph);
  try {
    return wg.isConnected('weak');
  } finally {
    wg.free();
  }
}
