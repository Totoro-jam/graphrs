import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
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

describe('@graphrs/generators', () => {
  describe('random generators', () => {
    it('erdosRenyi returns a Graph', async () => {
      const g = await erdosRenyi({ n: 10, p: 0.5 });
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(10);
    });

    it('barabasiAlbert returns a Graph', async () => {
      const g = await barabasiAlbert({ n: 10, m: 2 });
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(10);
    });

    it('wattsStrogatz returns a Graph', async () => {
      const g = await wattsStrogatz({ n: 10, k: 4, p: 0.3 });
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(10);
    });

    it('stochasticBlockModel returns a Graph', async () => {
      const g = await stochasticBlockModel({
        blockSizes: [5, 5],
        prefMatrix: [
          [0.8, 0.1],
          [0.1, 0.8],
        ],
      });
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(10);
    });
  });

  describe('deterministic generators', () => {
    it('complete returns a fully connected Graph', async () => {
      const g = await complete(5);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(5);
      expect(g.edgeCount()).toBe(10);
    });

    it('ring returns a Graph', async () => {
      const g = await ring(6);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(6);
      expect(g.edgeCount()).toBe(6);
    });

    it('lattice returns a Graph', async () => {
      const g = await lattice([3, 3]);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(9);
    });

    it('star returns a Graph', async () => {
      const g = await star(5);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(5);
    });

    it('tree returns a Graph', async () => {
      const g = await tree(7, 2);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(7);
    });

    it('path returns a Graph', async () => {
      const g = await path(5);
      expect(g).toBeInstanceOf(Graph);
      expect(g.nodeCount()).toBe(5);
      expect(g.edgeCount()).toBe(4);
    });
  });
});
