/**
 * Minimal G6 5.x data interfaces.
 *
 * Defined locally so @antv/g6 remains a peer-only dependency —
 * consumers who already have G6 installed get full type compat,
 * while the adapter itself never imports G6 at the type level.
 */

export interface G6NodeData {
  id: string;
  style?: {
    x?: number;
    y?: number;
    [key: string]: unknown;
  };
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface G6EdgeData {
  id?: string;
  source: string;
  target: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface G6GraphData {
  nodes: G6NodeData[];
  edges: G6EdgeData[];
}

export type LayoutAlgorithm =
  | 'fruchterman-reingold'
  | 'kamada-kawai'
  | 'circle'
  | 'grid'
  | 'star'
  | 'sugiyama'
  | 'random';

export interface GraphrsLayoutOptions {
  algorithm?: LayoutAlgorithm;
  iterations?: number;
  center?: [number, number];
  width?: number;
  height?: number;
}

export interface CommunityMapping {
  /** node id -> community index */
  communities: Map<string, number>;
  modularity: number;
  clusterCount: number;
}

export type CommunityAlgorithm =
  | 'louvain'
  | 'leiden'
  | 'infomap'
  | 'label-propagation'
  | 'walktrap'
  | 'fast-greedy';

export type CentralityAlgorithm = 'pagerank' | 'betweenness' | 'closeness' | 'eigenvector';

export interface CentralityMapping {
  /** node id -> centrality score */
  scores: Map<string, number>;
}

export interface NodePositionMap {
  [nodeId: string]: { x: number; y: number };
}
