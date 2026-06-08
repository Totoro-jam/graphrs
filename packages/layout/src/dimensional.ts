import type { Graph, LayoutResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface MDSOptions {
  dimensions?: 2 | 3;
}
export interface DRLOptions {
  iterations?: number;
}

export async function layoutMDS(graph: Graph, _options?: MDSOptions): Promise<LayoutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.layoutMds()) as { coords: [number, number][] };
    return { positions: raw.coords };
  } finally {
    wg.free();
  }
}

export async function layoutDRL(graph: Graph, _options?: DRLOptions): Promise<LayoutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.layoutDrl()) as { coords: [number, number][] };
    return { positions: raw.coords };
  } finally {
    wg.free();
  }
}
