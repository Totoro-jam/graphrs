import { getWasm, type Graph, type CommunityResult } from '@graphrs/core';

export interface FluidOptions {
  numCommunities: number;
}

export async function fluidCommunities(
  graph: Graph,
  options: FluidOptions,
): Promise<CommunityResult> {
  const _wasm = await getWasm();
  void _wasm;
  void options;
  void graph._getEdgePairs();
  throw new Error('Not yet implemented — WASM bindings pending');
}
