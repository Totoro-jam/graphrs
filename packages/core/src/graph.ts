import type {
  VertexId,
  NodeData,
  EdgeData,
  GraphOptions,
  SerializedGraph,
  LayoutResult,
  G6GraphData,
  ReactFlowData,
  CytoscapeData,
} from './types.js';
import { NodeNotFoundError, EdgeNotFoundError } from './errors.js';

interface InternalNode<N> {
  id: VertexId;
  data: N;
}

interface InternalEdge<E> {
  source: VertexId;
  target: VertexId;
  data: E;
}

export class Graph<N extends NodeData = NodeData, E extends EdgeData = EdgeData> {
  readonly directed: boolean;

  private _nodes: Map<VertexId, InternalNode<N>> = new Map();
  private _edges: InternalEdge<E>[] = [];
  private _adjacency: Map<VertexId, Set<VertexId>> = new Map();

  constructor(options?: GraphOptions) {
    this.directed = options?.directed ?? false;
  }

  static fromEdges<N extends NodeData = NodeData, E extends EdgeData = EdgeData>(
    edges: [number, number][],
    options?: GraphOptions,
  ): Graph<N, E> {
    const g = new Graph<N, E>(options);
    for (const [source, target] of edges) {
      if (!g.hasNode(source)) g.addNode(source);
      if (!g.hasNode(target)) g.addNode(target);
      g.addEdge(source, target);
    }
    return g;
  }

  static fromAdjacencyMatrix<N extends NodeData = NodeData, E extends EdgeData = EdgeData>(
    matrix: number[][],
    options?: GraphOptions,
  ): Graph<N, E> {
    const g = new Graph<N, E>(options);
    const n = matrix.length;
    for (let i = 0; i < n; i++) {
      g.addNode(i);
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i]![j]! > 0) {
          if (!g.directed && j <= i) continue;
          g.addEdge(i, j, { weight: matrix[i]![j] } as unknown as E);
        }
      }
    }
    return g;
  }

  static fromJSON<N extends NodeData = NodeData, E extends EdgeData = EdgeData>(
    data: SerializedGraph,
  ): Graph<N, E> {
    const g = new Graph<N, E>({ directed: data.directed });
    for (const node of data.nodes) {
      g.addNode(node.id, node.data as N);
    }
    for (const edge of data.edges) {
      g.addEdge(edge.source, edge.target, edge.data as E);
    }
    return g;
  }

  addNode(id: VertexId, data?: N): this {
    if (!this._nodes.has(id)) {
      this._nodes.set(id, { id, data: (data ?? {}) as N });
      this._adjacency.set(id, new Set());
    }
    return this;
  }

  addEdge(source: VertexId, target: VertexId, data?: E): this {
    if (!this._nodes.has(source)) this.addNode(source);
    if (!this._nodes.has(target)) this.addNode(target);

    this._edges.push({ source, target, data: (data ?? {}) as E });
    this._adjacency.get(source)!.add(target);
    if (!this.directed) {
      this._adjacency.get(target)!.add(source);
    }
    return this;
  }

  removeNode(id: VertexId): this {
    if (!this._nodes.has(id)) throw new NodeNotFoundError(id);

    this._nodes.delete(id);
    this._adjacency.delete(id);
    this._edges = this._edges.filter((e) => e.source !== id && e.target !== id);

    for (const neighbors of this._adjacency.values()) {
      neighbors.delete(id);
    }
    return this;
  }

  removeEdge(source: VertexId, target: VertexId): this {
    const idx = this._edges.findIndex((e) => e.source === source && e.target === target);
    if (idx === -1) throw new EdgeNotFoundError(source, target);

    this._edges.splice(idx, 1);
    const hasOther = this._edges.some((e) => e.source === source && e.target === target);
    if (!hasOther) {
      this._adjacency.get(source)?.delete(target);
      if (!this.directed) {
        this._adjacency.get(target)?.delete(source);
      }
    }
    return this;
  }

  nodeCount(): number {
    return this._nodes.size;
  }

  edgeCount(): number {
    return this._edges.length;
  }

  hasNode(id: VertexId): boolean {
    return this._nodes.has(id);
  }

  hasEdge(source: VertexId, target: VertexId): boolean {
    return this._edges.some((e) => e.source === source && e.target === target);
  }

  neighbors(id: VertexId): VertexId[] {
    const adj = this._adjacency.get(id);
    if (!adj) throw new NodeNotFoundError(id);
    return [...adj];
  }

  degree(id: VertexId): number {
    const adj = this._adjacency.get(id);
    if (!adj) throw new NodeNotFoundError(id);
    return adj.size;
  }

  nodes(): VertexId[] {
    return [...this._nodes.keys()];
  }

  edges(): Array<{ source: VertexId; target: VertexId; data: E }> {
    return this._edges.map((e) => ({ source: e.source, target: e.target, data: e.data }));
  }

  nodeData(id: VertexId): N {
    const node = this._nodes.get(id);
    if (!node) throw new NodeNotFoundError(id);
    return node.data;
  }

  subgraph(nodeIds: VertexId[]): Graph<N, E> {
    const nodeSet = new Set(nodeIds);
    const g = new Graph<N, E>({ directed: this.directed });
    for (const id of nodeIds) {
      if (this._nodes.has(id)) {
        g.addNode(id, this._nodes.get(id)!.data);
      }
    }
    for (const edge of this._edges) {
      if (nodeSet.has(edge.source) && nodeSet.has(edge.target)) {
        g.addEdge(edge.source, edge.target, edge.data);
      }
    }
    return g;
  }

  toJSON(): SerializedGraph {
    return {
      directed: this.directed,
      nodes: [...this._nodes.values()].map((n) => ({
        id: n.id,
        data: n.data as Record<string, unknown>,
      })),
      edges: this._edges.map((e) => ({
        source: e.source,
        target: e.target,
        data: e.data as Record<string, unknown>,
      })),
    };
  }

  toG6Format(layout?: LayoutResult): G6GraphData {
    const nodes = [...this._nodes.values()].map((n, i) => ({
      id: String(n.id),
      ...(layout ? { x: layout.positions[i]![0], y: layout.positions[i]![1] } : {}),
      ...(n.data as Record<string, unknown>),
    }));
    const edgesOut = this._edges.map((e) => ({
      source: String(e.source),
      target: String(e.target),
      ...(e.data as Record<string, unknown>),
    }));
    return { nodes, edges: edgesOut };
  }

  toReactFlowFormat(layout?: LayoutResult): ReactFlowData {
    const nodes = [...this._nodes.values()].map((n, i) => ({
      id: String(n.id),
      position: layout
        ? { x: layout.positions[i]![0]!, y: layout.positions[i]![1]! }
        : { x: 0, y: 0 },
      data: n.data as Record<string, unknown>,
    }));
    const edgesOut = this._edges.map((e, i) => ({
      id: `e-${i}`,
      source: String(e.source),
      target: String(e.target),
    }));
    return { nodes, edges: edgesOut };
  }

  toCytoscapeFormat(layout?: LayoutResult): CytoscapeData {
    const nodes = [...this._nodes.values()].map((n, i) => ({
      data: {
        id: String(n.id),
        ...(layout ? { x: layout.positions[i]![0], y: layout.positions[i]![1] } : {}),
        ...(n.data as Record<string, unknown>),
      },
    }));
    const edgesOut = this._edges.map((e) => ({
      data: {
        source: String(e.source),
        target: String(e.target),
        ...(e.data as Record<string, unknown>),
      },
    }));
    return { elements: { nodes, edges: edgesOut } };
  }

  _getEdgePairs(): [number, number][] {
    return this._edges.map((e) => [e.source, e.target]);
  }

  _getWeights(): number[] | null {
    const hasWeights = this._edges.some((e) => e.data.weight !== undefined);
    if (!hasWeights) return null;
    return this._edges.map((e) => (e.data.weight as number) ?? 1.0);
  }
}
