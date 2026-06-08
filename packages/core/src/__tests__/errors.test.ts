import { describe, it, expect } from 'vitest';
import {
  GraphError,
  NodeNotFoundError,
  EdgeNotFoundError,
  WasmNotInitializedError,
  WasmError,
} from '../errors.js';

describe('GraphError', () => {
  it('has code and message', () => {
    const err = new GraphError('TEST_CODE', 'test message');
    expect(err.code).toBe('TEST_CODE');
    expect(err.message).toBe('test message');
    expect(err.name).toBe('GraphError');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('NodeNotFoundError', () => {
  it('includes node id in message', () => {
    const err = new NodeNotFoundError(42);
    expect(err.code).toBe('NODE_NOT_FOUND');
    expect(err.message).toContain('42');
    expect(err).toBeInstanceOf(GraphError);
  });
});

describe('EdgeNotFoundError', () => {
  it('includes source and target in message', () => {
    const err = new EdgeNotFoundError(1, 2);
    expect(err.code).toBe('EDGE_NOT_FOUND');
    expect(err.message).toContain('1');
    expect(err.message).toContain('2');
    expect(err).toBeInstanceOf(GraphError);
  });
});

describe('WasmNotInitializedError', () => {
  it('has correct code', () => {
    const err = new WasmNotInitializedError();
    expect(err.code).toBe('WASM_NOT_INITIALIZED');
    expect(err).toBeInstanceOf(GraphError);
  });
});

describe('WasmError', () => {
  it('has correct code and message', () => {
    const err = new WasmError('something failed');
    expect(err.code).toBe('WASM_ERROR');
    expect(err.message).toBe('something failed');
    expect(err).toBeInstanceOf(GraphError);
  });
});
