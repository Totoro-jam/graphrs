import type { Graph, LayoutResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface SugiyamaOptions {
  layerSpacing?: number;
  nodeSpacing?: number;
}
export interface ReingoldTilfordOptions {
  rootNode?: number;
}

export async function layoutSugiyama(
  graph: Graph,
  _options?: SugiyamaOptions,
): Promise<LayoutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.layoutSugiyama()) as { coords: [number, number][] };
    return { positions: raw.coords };
  } finally {
    wg.free();
  }
}

export async function layoutReingoldTilford(
  graph: Graph,
  options?: ReingoldTilfordOptions,
): Promise<LayoutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const root = options?.rootNode ?? 0;
    const raw = JSON.parse(wg.layoutReingoldTilford(root)) as { coords: [number, number][] };
    return { positions: raw.coords };
  } finally {
    wg.free();
  }
}
