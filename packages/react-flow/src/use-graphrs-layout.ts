import { useState, useEffect, useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';
import {
  layoutFR,
  layoutKK,
  layoutCircle,
  layoutGrid,
  layoutStar,
  layoutRandom,
} from '@graphrs/layout';

import type { LayoutAlgorithm, UseGraphrsLayoutOptions, UseGraphrsLayoutResult } from './types.js';
import { reactFlowToGraph, applyLayout } from './adapters.js';

async function executeLayout(
  nodes: Node[],
  edges: Edge[],
  algorithm: LayoutAlgorithm,
  iterations?: number,
): Promise<Node[]> {
  const { graph } = reactFlowToGraph(nodes, edges);

  let layout;
  switch (algorithm) {
    case 'fruchterman-reingold':
      layout = await layoutFR(graph, iterations ? { iterations } : undefined);
      break;
    case 'kamada-kawai':
      layout = await layoutKK(graph);
      break;
    case 'circle':
      layout = await layoutCircle(graph);
      break;
    case 'grid':
      layout = await layoutGrid(graph);
      break;
    case 'star':
      layout = await layoutStar(graph);
      break;
    case 'random':
      layout = await layoutRandom(graph);
      break;
  }

  return applyLayout(nodes, layout);
}

/**
 * React hook that runs a graphrs layout algorithm on React Flow nodes and edges.
 *
 * When `enabled` is true (default), the layout runs automatically whenever
 * the input nodes/edges change. Use `runLayout()` to trigger a layout manually.
 */
export function useGraphrsLayout(
  inputNodes: Node[],
  inputEdges: Edge[],
  options?: UseGraphrsLayoutOptions,
): UseGraphrsLayoutResult {
  const algorithm = options?.algorithm ?? 'fruchterman-reingold';
  const iterations = options?.iterations;
  const enabled = options?.enabled ?? true;

  const [nodes, setNodes] = useState<Node[]>(inputNodes);
  const [isLayouting, setIsLayouting] = useState(false);

  // Track latest inputs to avoid stale closures
  const latestNodesRef = useRef(inputNodes);
  const latestEdgesRef = useRef(inputEdges);
  latestNodesRef.current = inputNodes;
  latestEdgesRef.current = inputEdges;

  const runLayout = useCallback(
    async (overrideAlgorithm?: LayoutAlgorithm): Promise<void> => {
      const currentNodes = latestNodesRef.current;
      const currentEdges = latestEdgesRef.current;

      if (currentNodes.length === 0) return;

      setIsLayouting(true);
      try {
        const layoutedNodes = await executeLayout(
          currentNodes,
          currentEdges,
          overrideAlgorithm ?? algorithm,
          iterations,
        );
        setNodes(layoutedNodes);
      } finally {
        setIsLayouting(false);
      }
    },
    [algorithm, iterations],
  );

  // Auto-run layout when inputs change and enabled is true
  useEffect(() => {
    if (!enabled) {
      setNodes(inputNodes);
      return;
    }
    void runLayout();
  }, [inputNodes, inputEdges, enabled, runLayout]);

  return { nodes, edges: inputEdges, isLayouting, runLayout };
}
