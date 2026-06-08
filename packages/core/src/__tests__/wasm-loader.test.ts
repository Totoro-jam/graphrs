import { describe, it, expect } from 'vitest';
import { isWasmInitialized, getWasmSync, getWasm } from '../wasm-loader.js';

describe('wasm-loader', () => {
  it('isWasmInitialized returns false before init', () => {
    expect(isWasmInitialized()).toBe(false);
  });

  it('getWasmSync returns null before init', () => {
    expect(getWasmSync()).toBeNull();
  });

  it('exports are functions', () => {
    expect(typeof getWasm).toBe('function');
    expect(typeof getWasmSync).toBe('function');
    expect(typeof isWasmInitialized).toBe('function');
  });
});
