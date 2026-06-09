import { describe, it, expect } from 'vitest';
import { reactFlowToGraph, applyLayout } from '../adapters.js';

const mockNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'A' } },
  { id: 'n2', position: { x: 100, y: 0 }, data: { label: 'B' } },
  { id: 'n3', position: { x: 50, y: 100 }, data: { label: 'C' } },
];

const mockEdges = [
  { id: 'e1', source: 'n1', target: 'n2' },
  { id: 'e2', source: 'n2', target: 'n3' },
];

describe('reactFlowToGraph', () => {
  it('should convert nodes and edges to a Graph', () => {
    const { graph, idMap } = reactFlowToGraph(mockNodes, mockEdges);
    expect(graph.nodeCount()).toBe(3);
    expect(graph.edgeCount()).toBe(2);
    expect(idMap.size).toBe(3);
  });

  it('should assign sequential numeric IDs', () => {
    const { idMap } = reactFlowToGraph(mockNodes, mockEdges);
    expect(idMap.get(0)).toBe('n1');
    expect(idMap.get(1)).toBe('n2');
    expect(idMap.get(2)).toBe('n3');
  });

  it('should create a directed graph by default', () => {
    const { graph } = reactFlowToGraph(mockNodes, mockEdges);
    expect(graph.hasEdge(0, 1)).toBe(true);
    expect(graph.hasEdge(1, 0)).toBe(false);
  });

  it('should create an undirected graph when specified', () => {
    const { graph } = reactFlowToGraph(mockNodes, mockEdges, { directed: false });
    expect(graph.hasEdge(0, 1)).toBe(true);
    // Undirected: neighbors are symmetric
    expect(graph.neighbors(1)).toContain(0);
    expect(graph.neighbors(0)).toContain(1);
  });

  it('should preserve node data', () => {
    const { graph } = reactFlowToGraph(mockNodes, mockEdges);
    expect(graph.nodeData(0)).toEqual({ label: 'A' });
    expect(graph.nodeData(1)).toEqual({ label: 'B' });
  });

  it('should skip edges referencing unknown nodes', () => {
    const edgesWithBadRef = [...mockEdges, { id: 'e3', source: 'n1', target: 'unknown' }];
    const { graph } = reactFlowToGraph(mockNodes, edgesWithBadRef);
    expect(graph.edgeCount()).toBe(2);
  });

  it('should handle empty inputs', () => {
    const { graph, idMap } = reactFlowToGraph([], []);
    expect(graph.nodeCount()).toBe(0);
    expect(graph.edgeCount()).toBe(0);
    expect(idMap.size).toBe(0);
  });
});

describe('applyLayout', () => {
  it('should apply layout positions to nodes', () => {
    const layout = {
      positions: [
        [1, 2],
        [3, 4],
        [5, 6],
      ] as [number, number][],
    };
    const result = applyLayout(mockNodes, layout);
    expect(result[0]!.position).toEqual({ x: 200, y: 400 });
    expect(result[1]!.position).toEqual({ x: 600, y: 800 });
    expect(result[2]!.position).toEqual({ x: 1000, y: 1200 });
  });

  it('should use custom scale', () => {
    const layout = {
      positions: [[1, 1]] as [number, number][],
    };
    const nodes = [{ id: 'n1', position: { x: 0, y: 0 }, data: {} }];
    const result = applyLayout(nodes, layout, { scale: 50 });
    expect(result[0]!.position).toEqual({ x: 50, y: 50 });
  });

  it('should default scale to 200', () => {
    const layout = {
      positions: [[1, 1]] as [number, number][],
    };
    const nodes = [{ id: 'n1', position: { x: 0, y: 0 }, data: {} }];
    const result = applyLayout(nodes, layout);
    expect(result[0]!.position).toEqual({ x: 200, y: 200 });
  });

  it('should not mutate original nodes', () => {
    const layout = {
      positions: [[5, 5]] as [number, number][],
    };
    const nodes = [{ id: 'n1', position: { x: 0, y: 0 }, data: {} }];
    const result = applyLayout(nodes, layout);
    expect(nodes[0]!.position).toEqual({ x: 0, y: 0 });
    expect(result[0]!.position).toEqual({ x: 1000, y: 1000 });
  });

  it('should return original node unchanged if position is undefined', () => {
    const layout = {
      positions: [undefined] as unknown as [number, number][],
    };
    const nodes = [{ id: 'n1', position: { x: 99, y: 99 }, data: {} }];
    const result = applyLayout(nodes, layout);
    expect(result[0]).toBe(nodes[0]);
  });

  it('should preserve other node properties', () => {
    const layout = {
      positions: [[1, 2]] as [number, number][],
    };
    const nodes = [{ id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Test' }, type: 'custom' }];
    const result = applyLayout(nodes, layout);
    expect(result[0]!.data).toEqual({ label: 'Test' });
    expect((result[0] as Record<string, unknown>).type).toBe('custom');
    expect(result[0]!.id).toBe('n1');
  });
});
