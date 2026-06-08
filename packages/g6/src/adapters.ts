import { Graph, type LayoutResult } from '@graphrs/core';
import type { G6GraphData, G6NodeData, G6EdgeData, NodePositionMap } from './types.js';

/**
 * Convert G6 graph data into a graphrs Graph.
 *
 * G6 uses string ids; graphrs uses numeric VertexIds. This function
 * creates a stable id-to-index mapping that is returned alongside the
 * graph so callers can map results back to G6 node ids.
 */
export function g6ToGraph(data: G6GraphData): {
  graph: Graph;
  idToIndex: Map<string, number>;
  indexToId: Map<number, string>;
} {
  const graph = new Graph({ directed: false });

  const idToIndex = new Map<string, number>();
  const indexToId = new Map<number, string>();

  data.nodes.forEach((node, i) => {
    idToIndex.set(node.id, i);
    indexToId.set(i, node.id);
    graph.addNode(i, node.data ?? {});
  });

  for (const edge of data.edges) {
    const sourceIdx = idToIndex.get(edge.source);
    const targetIdx = idToIndex.get(edge.target);
    if (sourceIdx !== undefined && targetIdx !== undefined) {
      graph.addEdge(sourceIdx, targetIdx, edge.data ?? {});
    }
  }

  return { graph, idToIndex, indexToId };
}

/**
 * Convert a graphrs Graph back into G6 graph data,
 * optionally applying a layout result for node positions.
 */
export function graphToG6(
  graph: Graph,
  indexToId: Map<number, string>,
  layout?: LayoutResult,
): G6GraphData {
  const nodeIds = graph.nodes();
  const nodes: G6NodeData[] = nodeIds.map((id, i) => {
    const stringId = indexToId.get(id) ?? String(id);
    const node: G6NodeData = { id: stringId };
    if (layout) {
      const pos = layout.positions[i];
      if (pos) {
        node.style = { x: pos[0], y: pos[1] };
      }
    }
    return node;
  });

  const edges: G6EdgeData[] = graph.edges().map((e) => ({
    source: indexToId.get(e.source) ?? String(e.source),
    target: indexToId.get(e.target) ?? String(e.target),
  }));

  return { nodes, edges };
}

/**
 * Map a LayoutResult from graphrs back to a position dictionary
 * keyed by G6 string node ids.
 */
export function layoutResultToPositions(
  layout: LayoutResult,
  nodeIds: string[],
  center?: [number, number],
  width?: number,
  height?: number,
): NodePositionMap {
  const positions: NodePositionMap = {};
  const cx = center?.[0] ?? 0;
  const cy = center?.[1] ?? 0;
  const w = width ?? 1;
  const h = height ?? 1;

  // Find bounding box for normalization
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const pos of layout.positions) {
    if (pos) {
      if (pos[0] < minX) minX = pos[0];
      if (pos[0] > maxX) maxX = pos[0];
      if (pos[1] < minY) minY = pos[1];
      if (pos[1] > maxY) maxY = pos[1];
    }
  }

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  for (let i = 0; i < nodeIds.length; i++) {
    const id = nodeIds[i];
    const pos = layout.positions[i];
    if (id !== undefined && pos) {
      positions[id] = {
        x: cx + ((pos[0] - minX) / rangeX - 0.5) * w,
        y: cy + ((pos[1] - minY) / rangeY - 0.5) * h,
      };
    }
  }

  return positions;
}
