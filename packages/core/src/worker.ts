export interface GraphWorker {
  run<T>(fn: (graphrs: unknown) => T | Promise<T>): Promise<T>;
  terminate(): void;
}

export function createGraphWorker(): GraphWorker {
  throw new Error(
    'Web Worker support is not yet implemented. ' +
      'Use the main thread API for now. Worker support coming in v0.2.0.',
  );
}
