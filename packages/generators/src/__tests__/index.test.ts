import { describe, it, expect } from 'vitest';
import {
  erdosRenyi,
  barabasiAlbert,
  wattsStrogatz,
  stochasticBlockModel,
  complete,
  ring,
  lattice,
  star,
  tree,
  path,
} from '../index.js';

const fns = [
  ['erdosRenyi', erdosRenyi],
  ['barabasiAlbert', barabasiAlbert],
  ['wattsStrogatz', wattsStrogatz],
  ['stochasticBlockModel', stochasticBlockModel],
  ['complete', complete],
  ['ring', ring],
  ['lattice', lattice],
  ['star', star],
  ['tree', tree],
  ['path', path],
] as const;

describe('@graphrs/generators', () => {
  it.each(fns)('%s is a function', (_, fn) => {
    expect(typeof fn).toBe('function');
  });

  it.each(fns)('%s returns a promise', (_, fn) => {
    const result = fn({} as never).catch(() => {});
    expect(result).toBeInstanceOf(Promise);
  });

  it.each(fns)('%s rejects when called (WASM not available)', async (_, fn) => {
    await expect(fn({} as never)).rejects.toThrow();
  });
});
