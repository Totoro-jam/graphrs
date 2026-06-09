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

const triangle = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
]);

const pathGraph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 3],
]);

describe('@graphrs/io integration (WASM)', () => {
  describe('GraphML', () => {
    it('roundtrip: write then read preserves structure', async () => {
      const xml = await writeGraphML(triangle);
      expect(xml).toContain('graphml');
      const restored = await readGraphML(xml);
      expect(restored.nodeCount()).toBe(3);
      expect(restored.edgeCount()).toBe(3);
    });

    it('reads a known GraphML string', async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphstruct.org/xmlns">
  <graph id="G" edgedefault="undirected">
    <node id="n0"/>
    <node id="n1"/>
    <node id="n2"/>
    <edge source="n0" target="n1"/>
    <edge source="n1" target="n2"/>
  </graph>
</graphml>`;
      const g = await readGraphML(xml);
      expect(g.nodeCount()).toBe(3);
      expect(g.edgeCount()).toBe(2);
    });

    it('roundtrip preserves larger graph', async () => {
      const xml = await writeGraphML(pathGraph);
      const restored = await readGraphML(xml);
      expect(restored.nodeCount()).toBe(4);
      expect(restored.edgeCount()).toBe(3);
    });
  });

  describe('GML', () => {
    it('roundtrip: write then read preserves structure', async () => {
      const text = await writeGML(triangle);
      expect(text).toContain('graph');
      const restored = await readGML(text);
      expect(restored.nodeCount()).toBe(3);
      expect(restored.edgeCount()).toBe(3);
    });

    it('reads a known GML string', async () => {
      const gml = `graph [
  directed 0
  node [ id 0 ]
  node [ id 1 ]
  node [ id 2 ]
  edge [ source 0 target 1 ]
  edge [ source 1 target 2 ]
]`;
      const g = await readGML(gml);
      expect(g.nodeCount()).toBe(3);
      expect(g.edgeCount()).toBe(2);
    });
  });

  describe('DOT', () => {
    it('roundtrip: write then read preserves structure', async () => {
      const text = await writeDOT(triangle);
      expect(text.length).toBeGreaterThan(0);
      const restored = await readDOT(text);
      expect(restored.nodeCount()).toBe(3);
      expect(restored.edgeCount()).toBe(3);
    });

    it('reads a known DOT string', async () => {
      const dot = `graph {
  0 -- 1;
  1 -- 2;
  2 -- 3;
}`;
      const g = await readDOT(dot);
      expect(g.nodeCount()).toBe(4);
      expect(g.edgeCount()).toBe(3);
    });
  });

  describe('EdgeList', () => {
    it('roundtrip: write then read preserves structure', async () => {
      const text = await writeEdgeList(triangle);
      expect(text.length).toBeGreaterThan(0);
      const restored = await readEdgeList(text);
      expect(restored.nodeCount()).toBe(3);
      expect(restored.edgeCount()).toBe(3);
    });

    it('reads a known edge list string', async () => {
      const el = '0 1\n1 2\n2 3\n';
      const g = await readEdgeList(el);
      expect(g.nodeCount()).toBe(4);
      expect(g.edgeCount()).toBe(3);
    });
  });

  describe('Pajek', () => {
    it('roundtrip: write then read preserves structure', async () => {
      const text = await writePajek(triangle);
      expect(text).toContain('*');
      const restored = await readPajek(text);
      expect(restored.nodeCount()).toBe(3);
      expect(restored.edgeCount()).toBe(3);
    });

    it('reads a known Pajek format', async () => {
      const pajek = `*Vertices 3
1 "v0"
2 "v1"
3 "v2"
*Edges
1 2
2 3
`;
      const g = await readPajek(pajek);
      expect(g.nodeCount()).toBe(3);
      expect(g.edgeCount()).toBe(2);
    });
  });

  describe('cross-format consistency', () => {
    it('same graph exported in different formats has consistent node/edge counts', async () => {
      const g = pathGraph;
      const [fromGml, fromDot, fromEl] = await Promise.all([
        writeGML(g).then(readGML),
        writeDOT(g).then(readDOT),
        writeEdgeList(g).then(readEdgeList),
      ]);
      expect(fromGml.nodeCount()).toBe(4);
      expect(fromDot.nodeCount()).toBe(4);
      expect(fromEl.nodeCount()).toBe(4);
      expect(fromGml.edgeCount()).toBe(3);
      expect(fromDot.edgeCount()).toBe(3);
      expect(fromEl.edgeCount()).toBe(3);
    });
  });
});
