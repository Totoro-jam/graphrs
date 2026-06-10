import { describe, it, expect } from 'vitest';
import { createGraphWorker } from '../worker.js';

describe('createGraphWorker', () => {
  it('is a function', () => {
    expect(typeof createGraphWorker).toBe('function');
  });

  it('throws with a helpful message', () => {
    expect(() => createGraphWorker()).toThrow('Web Worker support is not yet implemented');
  });

  it('error message suggests using the main thread API', () => {
    expect(() => createGraphWorker()).toThrow('Use the main thread API for now');
  });
});
