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

  it('getWasm returns a promise', () => {
    const result = getWasm();
    expect(result).toBeInstanceOf(Promise);
    result.catch(() => {});
  });

  it('getWasm resolves to a module with WasmGraph', async () => {
    const mod = await getWasm();
    expect(mod).toHaveProperty('WasmGraph');
    expect(typeof mod.WasmGraph).toBe('function');
  });

  it('isWasmInitialized returns true after getWasm resolves', async () => {
    await getWasm();
    expect(isWasmInitialized()).toBe(true);
  });

  it('getWasmSync returns the module after initialization', async () => {
    await getWasm();
    const mod = getWasmSync();
    expect(mod).not.toBeNull();
    expect(mod).toHaveProperty('WasmGraph');
  });

  it('subsequent getWasm calls return the cached module', async () => {
    const mod1 = await getWasm();
    const mod2 = await getWasm();
    expect(mod1).toBe(mod2);
  });
});
