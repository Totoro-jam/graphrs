import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import { maxFlow, minCut, vertexConnectivity, edgeConnectivity, isConnected } from '../index.js';

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
]);

describe('@graphrs/flow', () => {
  it('maxFlow returns a FlowResult', async () => {
    const directed = Graph.fromEdges(
      [
        [0, 1],
        [1, 2],
      ],
      { directed: true },
    );
    const result = await maxFlow(directed, 0, 2);
    expect(typeof result.value).toBe('number');
    expect(Array.isArray(result.flow)).toBe(true);
  });

  it('minCut returns a MinCutResult', async () => {
    const directed = Graph.fromEdges(
      [
        [0, 1],
        [1, 2],
      ],
      { directed: true },
    );
    const result = await minCut(directed, 0, 2);
    expect(typeof result.value).toBe('number');
    expect(Array.isArray(result.partition)).toBe(true);
    expect(result.partition.length).toBe(2);
    expect(Array.isArray(result.cutEdges)).toBe(true);
  });

  it('vertexConnectivity returns a number', async () => {
    const result = await vertexConnectivity(graph);
    expect(typeof result).toBe('number');
  });

  it('edgeConnectivity returns a number', async () => {
    const result = await edgeConnectivity(graph);
    expect(typeof result).toBe('number');
  });

  it('isConnected returns a boolean', async () => {
    const result = await isConnected(graph);
    expect(typeof result).toBe('boolean');
    expect(result).toBe(true);
  });
});
