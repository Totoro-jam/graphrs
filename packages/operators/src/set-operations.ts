import { Graph } from '@graphrs/core';
import { toWasmGraph, wasmGraphToGraph } from './utils.js';

export async function union(g1: Graph, g2: Graph): Promise<Graph> {
  const wg1 = await toWasmGraph(g1);
  try {
    const wg2 = await toWasmGraph(g2);
    try {
      const result = wg1.union(wg2);
      try {
        return wasmGraphToGraph(result);
      } finally {
        result.free();
      }
    } finally {
      wg2.free();
    }
  } finally {
    wg1.free();
  }
}

export async function intersection(g1: Graph, g2: Graph): Promise<Graph> {
  const wg1 = await toWasmGraph(g1);
  try {
    const wg2 = await toWasmGraph(g2);
    try {
      const result = wg1.intersection(wg2);
      try {
        return wasmGraphToGraph(result);
      } finally {
        result.free();
      }
    } finally {
      wg2.free();
    }
  } finally {
    wg1.free();
  }
}

export async function difference(g1: Graph, g2: Graph): Promise<Graph> {
  const wg1 = await toWasmGraph(g1);
  try {
    const wg2 = await toWasmGraph(g2);
    try {
      const result = wg1.difference(wg2);
      try {
        return wasmGraphToGraph(result);
      } finally {
        result.free();
      }
    } finally {
      wg2.free();
    }
  } finally {
    wg1.free();
  }
}
