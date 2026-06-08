import type { WasmExports } from './types.js';

let wasmInstance: WasmExports | null = null;
let initPromise: Promise<WasmExports> | null = null;

function detectEnvironment(): 'browser' | 'node' {
  if (typeof globalThis.process !== 'undefined' && globalThis.process.versions?.node) {
    return 'node';
  }
  return 'browser';
}

async function initWasm(): Promise<WasmExports> {
  const env = detectEnvironment();

  if (env === 'node') {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');

    const currentDir = dirname(fileURLToPath(import.meta.url));
    const wasmPath = join(currentDir, '..', 'wasm', 'igraph_wasm_bg.wasm');
    const jsGluePath = join(currentDir, '..', 'wasm', 'igraph_wasm.js');

    const initFn = (await import(jsGluePath)).default;
    const wasmBytes = await readFile(wasmPath);
    wasmInstance = await initFn(wasmBytes);
  } else {
    const wasmUrl = new URL('../wasm/igraph_wasm_bg.wasm', import.meta.url);
    const jsGlueUrl = new URL('../wasm/igraph_wasm.js', import.meta.url);

    const initFn = (await import(/* @vite-ignore */ jsGlueUrl.href)).default;
    wasmInstance = await initFn(wasmUrl);
  }

  return wasmInstance!;
}

export async function getWasm(): Promise<WasmExports> {
  if (wasmInstance) return wasmInstance;
  if (!initPromise) {
    initPromise = initWasm();
  }
  return initPromise;
}

export function getWasmSync(): WasmExports | null {
  return wasmInstance;
}

export function isWasmInitialized(): boolean {
  return wasmInstance !== null;
}
