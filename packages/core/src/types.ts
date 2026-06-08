export type VertexId = number;
export type EdgeId = number;

export interface GraphOptions {
  directed?: boolean;
}

export interface NodeData {
  [key: string]: unknown;
}

export interface EdgeData {
  weight?: number;
  [key: string]: unknown;
}

export interface SerializedGraph {
  directed: boolean;
  nodes: Array<{ id: VertexId; data?: Record<string, unknown> }>;
  edges: Array<{ source: VertexId; target: VertexId; data?: Record<string, unknown> }>;
}

export interface CommunityResult {
  membership: number[];
  modularity: number;
  clusters: number;
}

export interface CentralityResult {
  scores: number[];
}

export interface LayoutResult {
  positions: [number, number][];
}

export interface Layout3DResult {
  positions: [number, number, number][];
}

export interface PathResult {
  path: number[];
  distance: number;
}

export interface FlowResult {
  value: number;
  flow: number[];
}

export interface G6GraphData {
  nodes: Array<{ id: string; x?: number; y?: number; [key: string]: unknown }>;
  edges: Array<{ source: string; target: string; [key: string]: unknown }>;
}

export interface ReactFlowData {
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  edges: Array<{ id: string; source: string; target: string }>;
}

export interface CytoscapeData {
  elements: {
    nodes: Array<{ data: { id: string; [key: string]: unknown } }>;
    edges: Array<{ data: { source: string; target: string; [key: string]: unknown } }>;
  };
}
