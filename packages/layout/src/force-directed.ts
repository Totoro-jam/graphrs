import type { Graph, LayoutResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface FROptions {
  iterations?: number;
  cooling?: number;
}
export interface KKOptions {
  maxIterations?: number;
}
export interface GraphoptOptions {
  iterations?: number;
  charge?: number;
}

export async function layoutFR(graph: Graph, options?: FROptions): Promise<LayoutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const niter = options?.iterations ?? 500;
    const raw = JSON.parse(wg.layoutFr(niter)) as { coords: [number, number][] };
    return { positions: raw.coords };
  } finally {
    wg.free();
  }
}

export async function layoutKK(graph: Graph, _options?: KKOptions): Promise<LayoutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.layoutKamadaKawai()) as { coords: [number, number][] };
    return { positions: raw.coords };
  } finally {
    wg.free();
  }
}

export async function layoutGraphopt(
  graph: Graph,
  _options?: GraphoptOptions,
): Promise<LayoutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.layoutGraphopt()) as { coords: [number, number][] };
    return { positions: raw.coords };
  } finally {
    wg.free();
  }
}
