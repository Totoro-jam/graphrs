import type { Node, Edge } from '@xyflow/react';
import { Graph, type LayoutResult } from '@graphrs/core';

/**
 * Build a mapping from React Flow string node IDs to numeric vertex IDs,
 * and the reverse mapping from numeric IDs back to string IDs.
 */
function buildIdMappings(nodes: Node[]): {
  stringToNum: Map<string, number>;
  numToString: Map<number, string>;
} {
  const stringToNum = new Map<string, number>();
  const numToString = new Map<number, string>();
  nodes.forEach((node, index) => {
    stringToNum.set(node.id, index);
    numToString.set(index, node.id);
  });
  return { stringToNum, numToString };
}

/**
 * Convert React Flow nodes and edges into a graphrs Graph.
 *
 * React Flow uses string IDs; graphrs uses numeric VertexIds.
 * Nodes are assigned sequential numeric IDs (0, 1, 2, ...) in array order.
 * Node `data` is preserved as node data in the graph.
 * Edge `data` (if present) is preserved; edges referencing unknown nodes are skipped.
 */
export function reactFlowToGraph(
  nodes: Node[],
  edges: Edge[],
  options?: { directed?: boolean },
): { graph: Graph; idMap: Map<number, string> } {
  const { stringToNum, numToString } = buildIdMappings(nodes);
  const graph = new Graph({ directed: options?.directed ?? true });

  for (const node of nodes) {
    const numId = stringToNum.get(node.id);
    if (numId !== undefined) {
      graph.addNode(numId, node.data as Record<string, unknown>);
    }
  }

  for (const edge of edges) {
    const sourceNum = stringToNum.get(edge.source);
    const targetNum = stringToNum.get(edge.target);
    if (sourceNum !== undefined && targetNum !== undefined) {
      graph.addEdge(sourceNum, targetNum);
    }
  }

  return { graph, idMap: numToString };
}

/**
 * Apply a graphrs LayoutResult to React Flow nodes.
 *
 * Each node receives updated `position.x` and `position.y` from the layout.
 * The `scale` parameter multiplies raw layout coordinates (default: 200)
 * to produce reasonable pixel positions for React Flow's canvas.
 *
 * Returns a new array; input nodes are not mutated.
 */
export function applyLayout(
  nodes: Node[],
  layout: LayoutResult,
  options?: { scale?: number },
): Node[] {
  const scale = options?.scale ?? 200;

  return nodes.map((node, index) => {
    const pos = layout.positions[index];
    if (!pos) return node;

    return {
      ...node,
      position: {
        x: pos[0] * scale,
        y: pos[1] * scale,
      },
    };
  });
}
