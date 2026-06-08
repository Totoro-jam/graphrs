export class GraphError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'GraphError';
    this.code = code;
  }
}

export class WasmNotInitializedError extends GraphError {
  constructor() {
    super(
      'WASM_NOT_INITIALIZED',
      'WASM module has not been initialized. Call an async algorithm function first.',
    );
  }
}

export class NodeNotFoundError extends GraphError {
  constructor(id: number) {
    super('NODE_NOT_FOUND', `Node ${id} not found in graph`);
  }
}

export class EdgeNotFoundError extends GraphError {
  constructor(source: number, target: number) {
    super('EDGE_NOT_FOUND', `Edge (${source}, ${target}) not found in graph`);
  }
}

export class WasmError extends GraphError {
  constructor(message: string) {
    super('WASM_ERROR', message);
  }
}
