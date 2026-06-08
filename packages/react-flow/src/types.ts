import type { Node, Edge } from '@xyflow/react';

export type LayoutAlgorithm =
  | 'fruchterman-reingold'
  | 'kamada-kawai'
  | 'circle'
  | 'grid'
  | 'star'
  | 'random';

export interface UseGraphrsLayoutOptions {
  algorithm?: LayoutAlgorithm;
  iterations?: number;
  enabled?: boolean;
}

export interface UseGraphrsLayoutResult {
  nodes: Node[];
  edges: Edge[];
  isLayouting: boolean;
  runLayout: (algorithm?: LayoutAlgorithm) => Promise<void>;
}
