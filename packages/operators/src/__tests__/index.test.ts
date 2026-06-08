import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import {
  union,
  intersection,
  difference,
  simplify,
  reverse,
  toDirected,
  toUndirected,
  inducedSubgraph,
  complement,
} from '../index.js';

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
]);

const graph2 = Graph.fromEdges([
  [1, 2],
  [2, 3],
]);

describe('@graphrs/operators', () => {
  describe('transforms', () => {
    it('simplify returns a Graph', async () => {
      const g = await simplify(graph);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(3);
    });

    it('reverse returns a Graph', async () => {
      const directed = Graph.fromEdges(
        [
          [0, 1],
          [1, 2],
        ],
        { directed: true },
      );
      const g = await reverse(directed);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(3);
      expect(g.edgeCount()).toBe(2);
    });

    it('toDirected returns a directed Graph', async () => {
      const g = await toDirected(graph);
      expect(g).toBeInstanceOf(Graph);
      expect(g.directed).toBe(true);
      expect(g.nodeCount()).toBe(3);
    });

    it('toUndirected returns an undirected Graph', async () => {
      const directed = Graph.fromEdges(
        [
          [0, 1],
          [1, 0],
          [1, 2],
          [2, 1],
        ],
        { directed: true },
      );
      const g = await toUndirected(directed);
      expect(g).toBeInstanceOf(Graph);
      expect(g.directed).toBe(false);
      expect(g.nodeCount()).toBe(3);
    });
  });

  describe('set operations', () => {
    it('union returns a Graph', async () => {
      const g = await union(graph, graph2);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBeGreaterThanOrEqual(3);
    });

    it('intersection returns a Graph', async () => {
      const g = await intersection(graph, graph2);
      expect(g).toBeInstanceOf(Graph);
    });

    it('difference returns a Graph', async () => {
      const g = await difference(graph, graph2);
      expect(g).toBeInstanceOf(Graph);
    });
  });

  describe('subgraph & complement', () => {
    it('inducedSubgraph returns a Graph', async () => {
      const g = await inducedSubgraph(graph, [0, 1]);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(2);
    });

    it('complement returns a Graph', async () => {
      const g = await complement(graph);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(3);
    });
  });
});
