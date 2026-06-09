import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import { g6ToGraph, graphToG6, layoutResultToPositions } from '../adapters.js';
import type { G6GraphData } from '../types.js';

describe('g6ToGraph', () => {
  it('should convert G6 data to a Graph with correct node count', () => {
    const data: G6GraphData = {
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
      ],
    };
    const { graph, idToIndex, indexToId } = g6ToGraph(data);
    expect(graph.nodeCount()).toBe(3);
    expect(graph.edgeCount()).toBe(2);
    expect(idToIndex.size).toBe(3);
    expect(indexToId.size).toBe(3);
  });

  it('should produce sequential numeric indices', () => {
    const data: G6GraphData = {
      nodes: [{ id: 'x' }, { id: 'y' }, { id: 'z' }],
      edges: [],
    };
    const { idToIndex, indexToId } = g6ToGraph(data);
    expect(idToIndex.get('x')).toBe(0);
    expect(idToIndex.get('y')).toBe(1);
    expect(idToIndex.get('z')).toBe(2);
    expect(indexToId.get(0)).toBe('x');
    expect(indexToId.get(1)).toBe('y');
    expect(indexToId.get(2)).toBe('z');
  });

  it('should preserve node data', () => {
    const data: G6GraphData = {
      nodes: [{ id: 'a', data: { label: 'Node A', weight: 5 } }],
      edges: [],
    };
    const { graph } = g6ToGraph(data);
    expect(graph.nodeData(0)).toEqual({ label: 'Node A', weight: 5 });
  });

  it('should skip edges referencing unknown nodes', () => {
    const data: G6GraphData = {
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'missing' },
      ],
    };
    const { graph } = g6ToGraph(data);
    expect(graph.edgeCount()).toBe(1);
  });

  it('should handle empty graph', () => {
    const data: G6GraphData = { nodes: [], edges: [] };
    const { graph, idToIndex } = g6ToGraph(data);
    expect(graph.nodeCount()).toBe(0);
    expect(graph.edgeCount()).toBe(0);
    expect(idToIndex.size).toBe(0);
  });
});

describe('graphToG6', () => {
  it('should convert a Graph back to G6 format', () => {
    const graph = Graph.fromEdges([
      [0, 1],
      [1, 2],
    ]);
    const indexToId = new Map([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ]);
    const g6Data = graphToG6(graph, indexToId);
    expect(g6Data.nodes).toHaveLength(3);
    expect(g6Data.edges).toHaveLength(2);
    expect(g6Data.nodes[0]!.id).toBe('a');
    expect(g6Data.edges[0]!.source).toBe('a');
    expect(g6Data.edges[0]!.target).toBe('b');
  });

  it('should apply layout positions as style.x and style.y', () => {
    const graph = new Graph();
    graph.addNode(0);
    graph.addNode(1);
    const indexToId = new Map([
      [0, 'n1'],
      [1, 'n2'],
    ]);
    const layout = {
      positions: [
        [10, 20],
        [30, 40],
      ] as [number, number][],
    };
    const g6Data = graphToG6(graph, indexToId, layout);
    expect(g6Data.nodes[0]!.style?.x).toBe(10);
    expect(g6Data.nodes[0]!.style?.y).toBe(20);
    expect(g6Data.nodes[1]!.style?.x).toBe(30);
    expect(g6Data.nodes[1]!.style?.y).toBe(40);
  });

  it('should fall back to String(id) when indexToId has no mapping', () => {
    const graph = new Graph();
    graph.addNode(5);
    const indexToId = new Map<number, string>();
    const g6Data = graphToG6(graph, indexToId);
    expect(g6Data.nodes[0]!.id).toBe('5');
  });
});

describe('layoutResultToPositions', () => {
  it('should normalize positions within width and height', () => {
    const layout = {
      positions: [
        [0, 0],
        [10, 10],
      ] as [number, number][],
    };
    const nodeIds = ['a', 'b'];
    const positions = layoutResultToPositions(layout, nodeIds, [0, 0], 100, 100);
    expect(positions['a']!.x).toBe(-50);
    expect(positions['a']!.y).toBe(-50);
    expect(positions['b']!.x).toBe(50);
    expect(positions['b']!.y).toBe(50);
  });

  it('should center positions at given center point', () => {
    const layout = {
      positions: [
        [0, 0],
        [10, 10],
      ] as [number, number][],
    };
    const nodeIds = ['a', 'b'];
    const positions = layoutResultToPositions(layout, nodeIds, [500, 300], 200, 200);
    expect(positions['a']!.x).toBe(400);
    expect(positions['a']!.y).toBe(200);
    expect(positions['b']!.x).toBe(600);
    expect(positions['b']!.y).toBe(400);
  });

  it('should handle single node (zero range)', () => {
    const layout = { positions: [[5, 5]] as [number, number][] };
    const nodeIds = ['solo'];
    const positions = layoutResultToPositions(layout, nodeIds, [0, 0], 100, 100);
    expect(positions['solo']).toBeDefined();
    expect(typeof positions['solo']!.x).toBe('number');
  });

  it('should skip positions that are undefined', () => {
    const layout = { positions: [[1, 2], undefined] as ([number, number] | undefined)[] };
    const nodeIds = ['a', 'b'];
    const positions = layoutResultToPositions(layout, nodeIds, [0, 0], 100, 100);
    expect(positions['a']).toBeDefined();
    expect(positions['b']).toBeUndefined();
  });
});
