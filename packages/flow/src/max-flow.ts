import type { Graph, FlowResult } from '@graphrs/core';
import { toWasmGraph } from './utils.js';

export interface MaxFlowOptions {
  algorithm?: 'ford-fulkerson' | 'push-relabel';
}

export async function maxFlow(
  graph: Graph,
  source: number,
  target: number,
  _options?: MaxFlowOptions,
): Promise<FlowResult> {
  const wg = await toWasmGraph(graph);
  try {
    const raw = JSON.parse(wg.maxFlowDetailed(source, target)) as {
      value: number;
      flow: number[];
      cut: boolean[];
    };
    return {
      value: raw.value,
      flow: raw.flow,
    };
  } finally {
    wg.free();
  }
}
