import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import {
  readGraphML,
  writeGraphML,
  readGML,
  writeGML,
  readDOT,
  writeDOT,
  readEdgeList,
  writeEdgeList,
  readPajek,
  writePajek,
} from '../index.js';

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
]);

describe('@graphrs/io', () => {
  describe('GraphML', () => {
    it('writeGraphML returns a string', async () => {
      const xml = await writeGraphML(graph);
      expect(typeof xml).toBe('string');
      expect(xml.length).toBeGreaterThan(0);
    });

    it('roundtrip preserves structure', async () => {
      const xml = await writeGraphML(graph);
      const g = await readGraphML(xml);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(3);
      expect(g.edgeCount()).toBe(2);
    });
  });

  describe('GML', () => {
    it('writeGML returns a string', async () => {
      const text = await writeGML(graph);
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('roundtrip preserves structure', async () => {
      const text = await writeGML(graph);
      const g = await readGML(text);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(3);
      expect(g.edgeCount()).toBe(2);
    });
  });

  describe('DOT', () => {
    it('writeDOT returns a string', async () => {
      const text = await writeDOT(graph);
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('roundtrip preserves structure', async () => {
      const text = await writeDOT(graph);
      const g = await readDOT(text);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(3);
      expect(g.edgeCount()).toBe(2);
    });
  });

  describe('EdgeList', () => {
    it('writeEdgeList returns a string', async () => {
      const text = await writeEdgeList(graph);
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('roundtrip preserves structure', async () => {
      const text = await writeEdgeList(graph);
      const g = await readEdgeList(text);
      expect(g).toBeInstanceOf(Graph);
      expect(g.edgeCount()).toBe(2);
    });
  });

  describe('Pajek', () => {
    it('writePajek returns a string', async () => {
      const text = await writePajek(graph);
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('roundtrip preserves structure', async () => {
      const text = await writePajek(graph);
      const g = await readPajek(text);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(3);
      expect(g.edgeCount()).toBe(2);
    });
  });
});
