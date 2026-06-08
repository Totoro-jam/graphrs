interface WasmGraphClass {
  fromEdges(edges_flat: Uint32Array, directed: boolean): WasmGraphInstance;
  new (directed: boolean): WasmGraphInstance;

  // Generators (static factory methods)
  erdosRenyi(n: number, p: number, seed: bigint): WasmGraphInstance;
  barabasiAlbert(n: number, m: number, seed: bigint): WasmGraphInstance;
  wattsStrogatz(n: number, k: number, p: number, seed: bigint): WasmGraphInstance;
  fullGraph(n: number): WasmGraphInstance;
  ringGraph(n: number, circular: boolean): WasmGraphInstance;
  squareLattice(
    dims: Uint32Array,
    nei: number,
    directed: boolean,
    mutual: boolean,
  ): WasmGraphInstance;
  starGraph(n: number): WasmGraphInstance;
  karyTree(n: number, children: number, mode: string): WasmGraphInstance;
  pathGraph(n: number, directed: boolean): WasmGraphInstance;
  sbmGame(
    prefMatrixFlat: Float64Array,
    nBlocks: number,
    blockSizes: Uint32Array,
    directed: boolean,
    seed: number,
  ): WasmGraphInstance;

  // IO readers (static factory methods)
  readGraphml(text: string): WasmGraphInstance;
  readGml(text: string): WasmGraphInstance;
  readEdgelist(text: string): WasmGraphInstance;
  readPajek(text: string): WasmGraphInstance;
  readDot(text: string): WasmGraphInstance;
}

export interface WasmGraphInstance {
  free(): void;
  vcount(): number;
  ecount(): number;
  getEdges(): Uint32Array;
  isDirected(): boolean;

  // Community detection
  louvain(): string;
  leiden(): string;
  infomap(): string;
  labelPropagation(): string;
  walktrap(): string;
  fastGreedy(): string;
  spinglass(): string;
  fluidCommunities(k: number): string;

  // Centrality
  pagerank(): string;
  betweenness(): string;
  closeness(): string;
  eigenvectorCentrality(): string;
  hubAndAuthorityScores(): string;
  katzCentrality(): string;
  harmonicCentrality(): string;

  // Path / traversal
  dijkstra(source: number, weights: Float64Array): string;
  bellmanFordDistances(source: number, weights: Float64Array): string;
  bfs(root: number): string;
  dfs(root: number): string;
  floydWarshallDistances(): string;

  // Layout
  layoutFr(niter: number): string;
  layoutKamadaKawai(): string;
  layoutGraphopt(): string;
  layoutSugiyama(): string;
  layoutReingoldTilford(root: number): string;
  layoutCircle(): string;
  layoutGrid(width: number): string;
  layoutStar(center: number): string;
  layoutRandom(seed: bigint): string;
  layoutMds(): string;
  layoutDrl(): string;

  // Operators
  simplify(): WasmGraphInstance;
  reverse(): WasmGraphInstance;
  complement(): WasmGraphInstance;
  union(other: WasmGraphInstance): WasmGraphInstance;
  intersection(other: WasmGraphInstance): WasmGraphInstance;
  difference(other: WasmGraphInstance): WasmGraphInstance;
  toDirected(mode: string): string;
  toUndirected(mode: string): string;
  inducedSubgraph(vids: Uint32Array): string;

  // Flow
  maxFlow(source: number, target: number): string;
  maxFlowDetailed(source: number, target: number): string;
  mincut(): string;
  stMincut(source: number, target: number): string;
  vertexConnectivity(): string;
  edgeConnectivity(): string;
  isConnected(mode: string): boolean;

  // Isomorphism
  isomorphic(other: WasmGraphInstance): boolean;
  subisomorphic(other: WasmGraphInstance): boolean;
  canonicalPermutation(): string;
  countAutomorphisms(): string;

  // I/O (write)
  writeGraphml(): string;
  writeGml(): string;
  writeDot(): string;
  writeEdgelist(): string;
  writePajek(): string;

  [key: string]: unknown;
}

export interface WasmModule {
  WasmGraph: WasmGraphClass;
}

let wasmModule: WasmModule | null = null;
let initPromise: Promise<WasmModule> | null = null;

function detectEnvironment(): 'browser' | 'node' {
  if (typeof globalThis.process !== 'undefined' && globalThis.process.versions?.node) {
    return 'node';
  }
  return 'browser';
}

async function initWasm(): Promise<WasmModule> {
  const env = detectEnvironment();

  if (env === 'node') {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');

    const currentDir = dirname(fileURLToPath(import.meta.url));
    const wasmPath = join(currentDir, '..', 'wasm', 'igraph_wasm_bg.wasm');
    const jsGluePath = join(currentDir, '..', 'wasm', 'igraph_wasm.js');

    const glueModule = await import(jsGluePath);
    const wasmBytes = await readFile(wasmPath);
    await glueModule.default({ module_or_path: wasmBytes });

    wasmModule = { WasmGraph: glueModule.WasmGraph };
  } else {
    const wasmUrl = new URL('../wasm/igraph_wasm_bg.wasm', import.meta.url);
    const jsGlueUrl = new URL('../wasm/igraph_wasm.js', import.meta.url);

    const glueModule = await import(/* @vite-ignore */ jsGlueUrl.href);
    await glueModule.default(wasmUrl);

    wasmModule = { WasmGraph: glueModule.WasmGraph };
  }

  return wasmModule;
}

export async function getWasm(): Promise<WasmModule> {
  if (wasmModule) return wasmModule;
  if (!initPromise) {
    initPromise = initWasm();
  }
  return initPromise;
}

export function getWasmSync(): WasmModule | null {
  return wasmModule;
}

export function isWasmInitialized(): boolean {
  return wasmModule !== null;
}
