import { describe, it, expect } from 'vitest';
import { Graph } from '../graph.js';
import { NodeNotFoundError, EdgeNotFoundError } from '../errors.js';
import type { LayoutResult, SerializedGraph } from '../types.js';

describe('Graph', () => {
  describe('constructor', () => {
    it('defaults to undirected', () => {
      const g = new Graph();
      expect(g.directed).toBe(false);
    });

    it('creates directed graph', () => {
      const g = new Graph({ directed: true });
      expect(g.directed).toBe(true);
    });

    it('creates explicit undirected graph', () => {
      const g = new Graph({ directed: false });
      expect(g.directed).toBe(false);
    });
  });

  describe('addNode', () => {
    it('adds a node', () => {
      const g = new Graph();
      g.addNode(0);
      expect(g.hasNode(0)).toBe(true);
      expect(g.nodeCount()).toBe(1);
    });

    it('adds a node with data', () => {
      const g = new Graph();
      g.addNode(0, { label: 'A' });
      expect(g.nodeData(0)).toEqual({ label: 'A' });
    });

    it('is idempotent', () => {
      const g = new Graph();
      g.addNode(0);
      g.addNode(0);
      expect(g.nodeCount()).toBe(1);
    });

    it('supports chaining', () => {
      const g = new Graph();
      const result = g.addNode(0).addNode(1);
      expect(result).toBe(g);
      expect(g.nodeCount()).toBe(2);
    });
  });

  describe('addEdge', () => {
    it('adds an edge', () => {
      const g = new Graph();
      g.addNode(0).addNode(1);
      g.addEdge(0, 1);
      expect(g.hasEdge(0, 1)).toBe(true);
      expect(g.edgeCount()).toBe(1);
    });

    it('auto-creates nodes', () => {
      const g = new Graph();
      g.addEdge(0, 1);
      expect(g.hasNode(0)).toBe(true);
      expect(g.hasNode(1)).toBe(true);
    });

    it('adds edge with weight data', () => {
      const g = new Graph();
      g.addEdge(0, 1, { weight: 3.5 });
      const edges = g.edges();
      expect(edges[0]!.data.weight).toBe(3.5);
    });

    it('supports chaining', () => {
      const g = new Graph();
      const result = g.addEdge(0, 1).addEdge(1, 2);
      expect(result).toBe(g);
      expect(g.edgeCount()).toBe(2);
    });

    it('allows parallel edges', () => {
      const g = new Graph();
      g.addEdge(0, 1).addEdge(0, 1);
      expect(g.edgeCount()).toBe(2);
    });
  });

  describe('removeNode', () => {
    it('removes a node', () => {
      const g = new Graph();
      g.addNode(0).addNode(1);
      g.removeNode(0);
      expect(g.hasNode(0)).toBe(false);
      expect(g.nodeCount()).toBe(1);
    });

    it('removes associated edges', () => {
      const g = new Graph();
      g.addEdge(0, 1).addEdge(1, 2);
      g.removeNode(1);
      expect(g.edgeCount()).toBe(0);
    });

    it('updates adjacency of remaining nodes', () => {
      const g = new Graph();
      g.addEdge(0, 1).addEdge(0, 2);
      g.removeNode(1);
      expect(g.neighbors(0)).toEqual([2]);
    });

    it('throws NodeNotFoundError for missing node', () => {
      const g = new Graph();
      expect(() => g.removeNode(99)).toThrow(NodeNotFoundError);
    });
  });

  describe('removeEdge', () => {
    it('removes an edge', () => {
      const g = new Graph();
      g.addEdge(0, 1);
      g.removeEdge(0, 1);
      expect(g.edgeCount()).toBe(0);
    });

    it('updates adjacency', () => {
      const g = new Graph();
      g.addEdge(0, 1);
      g.removeEdge(0, 1);
      expect(g.neighbors(0)).toEqual([]);
    });

    it('throws EdgeNotFoundError for missing edge', () => {
      const g = new Graph();
      g.addNode(0).addNode(1);
      expect(() => g.removeEdge(0, 1)).toThrow(EdgeNotFoundError);
    });

    it('handles multi-edges correctly', () => {
      const g = new Graph();
      g.addEdge(0, 1).addEdge(0, 1);
      g.removeEdge(0, 1);
      expect(g.edgeCount()).toBe(1);
      expect(g.hasEdge(0, 1)).toBe(true);
    });
  });

  describe('nodeCount / edgeCount', () => {
    it('returns 0 for empty graph', () => {
      const g = new Graph();
      expect(g.nodeCount()).toBe(0);
      expect(g.edgeCount()).toBe(0);
    });

    it('counts correctly after additions', () => {
      const g = new Graph();
      g.addEdge(0, 1).addEdge(1, 2);
      expect(g.nodeCount()).toBe(3);
      expect(g.edgeCount()).toBe(2);
    });

    it('counts correctly after removal', () => {
      const g = new Graph();
      g.addEdge(0, 1).addEdge(1, 2);
      g.removeEdge(1, 2);
      expect(g.edgeCount()).toBe(1);
    });
  });

  describe('hasNode / hasEdge', () => {
    it('returns false for non-existing', () => {
      const g = new Graph();
      expect(g.hasNode(99)).toBe(false);
      expect(g.hasEdge(0, 1)).toBe(false);
    });

    it('hasEdge checks direction in directed graph', () => {
      const g = new Graph({ directed: true });
      g.addEdge(0, 1);
      expect(g.hasEdge(0, 1)).toBe(true);
      expect(g.hasEdge(1, 0)).toBe(false);
    });
  });

  describe('neighbors', () => {
    it('returns neighbors in undirected graph', () => {
      const g = new Graph();
      g.addEdge(0, 1).addEdge(0, 2);
      const n = g.neighbors(0);
      expect(n.sort()).toEqual([1, 2]);
    });

    it('returns only outgoing neighbors in directed graph', () => {
      const g = new Graph({ directed: true });
      g.addEdge(0, 1).addEdge(2, 0);
      expect(g.neighbors(0)).toEqual([1]);
    });

    it('throws for missing node', () => {
      const g = new Graph();
      expect(() => g.neighbors(99)).toThrow(NodeNotFoundError);
    });
  });

  describe('degree', () => {
    it('returns degree', () => {
      const g = new Graph();
      g.addEdge(0, 1).addEdge(0, 2).addEdge(0, 3);
      expect(g.degree(0)).toBe(3);
    });

    it('returns out-degree in directed graph', () => {
      const g = new Graph({ directed: true });
      g.addEdge(0, 1).addEdge(2, 0);
      expect(g.degree(0)).toBe(1);
    });

    it('throws for missing node', () => {
      const g = new Graph();
      expect(() => g.degree(99)).toThrow(NodeNotFoundError);
    });
  });

  describe('nodes / edges', () => {
    it('returns empty lists for empty graph', () => {
      const g = new Graph();
      expect(g.nodes()).toEqual([]);
      expect(g.edges()).toEqual([]);
    });

    it('returns correct node ids', () => {
      const g = new Graph();
      g.addNode(5).addNode(10).addNode(3);
      expect(g.nodes().sort((a, b) => a - b)).toEqual([3, 5, 10]);
    });

    it('returns correct edges', () => {
      const g = new Graph();
      g.addEdge(0, 1, { weight: 2 });
      const edges = g.edges();
      expect(edges).toHaveLength(1);
      expect(edges[0]).toEqual({ source: 0, target: 1, data: { weight: 2 } });
    });
  });

  describe('nodeData', () => {
    it('returns node data', () => {
      const g = new Graph();
      g.addNode(0, { label: 'test' });
      expect(g.nodeData(0)).toEqual({ label: 'test' });
    });

    it('returns empty object when no data provided', () => {
      const g = new Graph();
      g.addNode(0);
      expect(g.nodeData(0)).toEqual({});
    });

    it('throws for missing node', () => {
      const g = new Graph();
      expect(() => g.nodeData(99)).toThrow(NodeNotFoundError);
    });
  });

  describe('subgraph', () => {
    it('extracts correct subgraph', () => {
      const g = new Graph();
      g.addEdge(0, 1).addEdge(1, 2).addEdge(2, 3);
      const sub = g.subgraph([0, 1, 2]);
      expect(sub.nodeCount()).toBe(3);
      expect(sub.edgeCount()).toBe(2);
      expect(sub.hasNode(3)).toBe(false);
    });

    it('includes only internal edges', () => {
      const g = new Graph();
      g.addEdge(0, 1).addEdge(1, 2).addEdge(2, 3);
      const sub = g.subgraph([0, 2]);
      expect(sub.edgeCount()).toBe(0);
    });

    it('preserves node data', () => {
      const g = new Graph();
      g.addNode(0, { label: 'A' });
      g.addNode(1, { label: 'B' });
      const sub = g.subgraph([0]);
      expect(sub.nodeData(0)).toEqual({ label: 'A' });
    });

    it('preserves directed property', () => {
      const g = new Graph({ directed: true });
      g.addEdge(0, 1);
      const sub = g.subgraph([0, 1]);
      expect(sub.directed).toBe(true);
    });
  });

  describe('fromEdges', () => {
    it('creates graph from edge list', () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      expect(g.nodeCount()).toBe(4);
      expect(g.edgeCount()).toBe(3);
    });

    it('creates directed graph from edges', () => {
      const g = Graph.fromEdges(
        [
          [0, 1],
          [1, 0],
        ],
        { directed: true },
      );
      expect(g.directed).toBe(true);
      expect(g.edgeCount()).toBe(2);
    });
  });

  describe('fromAdjacencyMatrix', () => {
    it('creates undirected graph', () => {
      const matrix = [
        [0, 1, 0],
        [1, 0, 1],
        [0, 1, 0],
      ];
      const g = Graph.fromAdjacencyMatrix(matrix);
      expect(g.nodeCount()).toBe(3);
      expect(g.edgeCount()).toBe(2);
      expect(g.directed).toBe(false);
    });

    it('creates directed graph', () => {
      const matrix = [
        [0, 1, 0],
        [0, 0, 1],
        [0, 0, 0],
      ];
      const g = Graph.fromAdjacencyMatrix(matrix, { directed: true });
      expect(g.nodeCount()).toBe(3);
      expect(g.edgeCount()).toBe(2);
      expect(g.directed).toBe(true);
    });

    it('preserves weights', () => {
      const matrix = [
        [0, 5, 0],
        [5, 0, 3],
        [0, 3, 0],
      ];
      const g = Graph.fromAdjacencyMatrix(matrix);
      const edges = g.edges();
      expect(edges.some((e) => e.data.weight === 5)).toBe(true);
      expect(edges.some((e) => e.data.weight === 3)).toBe(true);
    });
  });

  describe('fromJSON', () => {
    it('creates graph from serialized data', () => {
      const data: SerializedGraph = {
        directed: true,
        nodes: [
          { id: 0, data: { label: 'A' } },
          { id: 1, data: { label: 'B' } },
        ],
        edges: [{ source: 0, target: 1, data: { weight: 2 } }],
      };
      const g = Graph.fromJSON(data);
      expect(g.directed).toBe(true);
      expect(g.nodeCount()).toBe(2);
      expect(g.edgeCount()).toBe(1);
      expect(g.nodeData(0)).toEqual({ label: 'A' });
    });
  });

  describe('toJSON', () => {
    it('roundtrips correctly', () => {
      const g = new Graph({ directed: true });
      g.addNode(0, { label: 'A' });
      g.addNode(1, { label: 'B' });
      g.addEdge(0, 1, { weight: 5 });

      const json = g.toJSON();
      const g2 = Graph.fromJSON(json);
      expect(g2.directed).toBe(true);
      expect(g2.nodeCount()).toBe(2);
      expect(g2.edgeCount()).toBe(1);
      expect(g2.nodeData(0)).toEqual({ label: 'A' });
    });
  });

  describe('toG6Format', () => {
    it('converts to G6 format', () => {
      const g = new Graph();
      g.addNode(0, { label: 'A' });
      g.addNode(1, { label: 'B' });
      g.addEdge(0, 1);

      const data = g.toG6Format();
      expect(data.nodes).toHaveLength(2);
      expect(data.edges).toHaveLength(1);
      expect(data.nodes[0]!.id).toBe('0');
      expect(data.edges[0]!.source).toBe('0');
      expect(data.edges[0]!.target).toBe('1');
    });

    it('includes layout positions', () => {
      const g = new Graph();
      g.addNode(0).addNode(1);
      const layout: LayoutResult = { positions: [[10, 20], [30, 40]] };
      const data = g.toG6Format(layout);
      expect(data.nodes[0]!.x).toBe(10);
      expect(data.nodes[0]!.y).toBe(20);
    });
  });

  describe('toReactFlowFormat', () => {
    it('converts to React Flow format', () => {
      const g = new Graph();
      g.addNode(0, { label: 'A' });
      g.addNode(1);
      g.addEdge(0, 1);

      const data = g.toReactFlowFormat();
      expect(data.nodes).toHaveLength(2);
      expect(data.nodes[0]!.id).toBe('0');
      expect(data.nodes[0]!.position).toEqual({ x: 0, y: 0 });
      expect(data.nodes[0]!.data).toEqual({ label: 'A' });
      expect(data.edges[0]!.id).toBe('e-0');
      expect(data.edges[0]!.source).toBe('0');
    });

    it('uses layout positions', () => {
      const g = new Graph();
      g.addNode(0).addNode(1);
      const layout: LayoutResult = { positions: [[100, 200], [300, 400]] };
      const data = g.toReactFlowFormat(layout);
      expect(data.nodes[0]!.position).toEqual({ x: 100, y: 200 });
    });
  });

  describe('toCytoscapeFormat', () => {
    it('converts to Cytoscape format', () => {
      const g = new Graph();
      g.addNode(0).addNode(1);
      g.addEdge(0, 1);

      const data = g.toCytoscapeFormat();
      expect(data.elements.nodes).toHaveLength(2);
      expect(data.elements.edges).toHaveLength(1);
      expect(data.elements.nodes[0]!.data.id).toBe('0');
      expect(data.elements.edges[0]!.data.source).toBe('0');
    });

    it('includes layout positions', () => {
      const g = new Graph();
      g.addNode(0);
      const layout: LayoutResult = { positions: [[50, 60]] };
      const data = g.toCytoscapeFormat(layout);
      expect(data.elements.nodes[0]!.data.x).toBe(50);
      expect(data.elements.nodes[0]!.data.y).toBe(60);
    });
  });

  describe('_getEdgePairs', () => {
    it('returns edge pairs as tuples', () => {
      const g = new Graph();
      g.addEdge(0, 1).addEdge(2, 3);
      expect(g._getEdgePairs()).toEqual([
        [0, 1],
        [2, 3],
      ]);
    });
  });

  describe('_getWeights', () => {
    it('returns null when no weights', () => {
      const g = new Graph();
      g.addEdge(0, 1);
      expect(g._getWeights()).toBeNull();
    });

    it('returns weights array', () => {
      const g = new Graph();
      g.addEdge(0, 1, { weight: 2.5 });
      g.addEdge(1, 2, { weight: 1.0 });
      expect(g._getWeights()).toEqual([2.5, 1.0]);
    });

    it('defaults missing weights to 1.0', () => {
      const g = new Graph();
      g.addEdge(0, 1, { weight: 3 });
      g.addEdge(1, 2);
      expect(g._getWeights()).toEqual([3, 1.0]);
    });
  });
});
