import type { Graph } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export async function isIsomorphic(g1: Graph, g2: Graph): Promise<boolean> {
  const wg1 = await toWasmGraph(g1);
  try {
    const wg2 = await toWasmGraph(g2);
    try {
      return wg1.isomorphic(wg2);
    } finally {
      wg2.free();
    }
  } finally {
    wg1.free();
  }
}

export async function subgraphIsomorphic(g1: Graph, g2: Graph): Promise<boolean> {
  const wg1 = await toWasmGraph(g1);
  try {
    const wg2 = await toWasmGraph(g2);
    try {
      return wg1.subisomorphic(wg2);
    } finally {
      wg2.free();
    }
  } finally {
    wg1.free();
  }
}
