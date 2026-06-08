import type { Graph, LayoutResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export async function layoutCircle(graph: Graph): Promise<LayoutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.layoutCircle()) as { coords: [number, number][] };
    return { positions: raw.coords };
  } finally {
    wg.free();
  }
}

export async function layoutGrid(graph: Graph, width?: number): Promise<LayoutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.layoutGrid(width ?? 0)) as { coords: [number, number][] };
    return { positions: raw.coords };
  } finally {
    wg.free();
  }
}

export async function layoutStar(graph: Graph, center?: number): Promise<LayoutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.layoutStar(center ?? 0)) as { coords: [number, number][] };
    return { positions: raw.coords };
  } finally {
    wg.free();
  }
}

export async function layoutRandom(graph: Graph, seed?: number): Promise<LayoutResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.layoutRandom(BigInt(seed ?? 0))) as {
      coords: [number, number][];
    };
    return { positions: raw.coords };
  } finally {
    wg.free();
  }
}
