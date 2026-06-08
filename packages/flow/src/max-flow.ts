import { getWasm, type Graph, type FlowResult } from '@graphrs/core';

export interface MaxFlowOptions {
  algorithm?: 'ford-fulkerson' | 'push-relabel';
}

export async function maxFlow(
  graph: Graph,
  source: number,
  target: number,
  options?: MaxFlowOptions,
): Promise<FlowResult> {
  const _wasm = await getWasm();
  void _wasm;
  void source;
  void target;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
