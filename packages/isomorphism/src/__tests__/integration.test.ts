import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import {
  isIsomorphic,
  subgraphIsomorphic,
  canonicalPermutation,
  automorphismGroupSize,
} from '../index.js';

describe('@graphrs/isomorphism integration (WASM)', () => {
  describe('isIsomorphic', () => {
    it('K3 is isomorphic to K3 with different node arrangement', async () => {
      const k3a = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 0],
      ]);
      // Same structure but edges listed differently
      const k3b = Graph.fromEdges([
        [0, 2],
        [2, 1],
        [1, 0],
      ]);
      const result = await isIsomorphic(k3a, k3b);
      expect(result).toBe(true);
    });

    it('K3 is not isomorphic to path of 3 nodes', async () => {
      const k3 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 0],
      ]);
      const p3 = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const result = await isIsomorphic(k3, p3);
      expect(result).toBe(false);
    });

    it('graphs with different node counts are not isomorphic', async () => {
      const g3 = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const g4 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      const result = await isIsomorphic(g3, g4);
      expect(result).toBe(false);
    });

    it('4-cycle is isomorphic to another 4-cycle', async () => {
      const c4a = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ]);
      const c4b = Graph.fromEdges([
        [0, 2],
        [2, 1],
        [1, 3],
        [3, 0],
      ]);
      const result = await isIsomorphic(c4a, c4b);
      expect(result).toBe(true);
    });

    it('K4 is not isomorphic to 4-cycle', async () => {
      const k4 = Graph.fromEdges([
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
      const c4 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ]);
      const result = await isIsomorphic(k4, c4);
      expect(result).toBe(false);
    });
  });

  describe('subgraphIsomorphic', () => {
    it('triangle is subgraph of K4', async () => {
      const k4 = Graph.fromEdges([
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
      const k3 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 0],
      ]);
      const result = await subgraphIsomorphic(k4, k3);
      expect(result).toBe(true);
    });

    it('K4 is not subgraph of triangle', async () => {
      const k4 = Graph.fromEdges([
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
      const k3 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 0],
      ]);
      const result = await subgraphIsomorphic(k3, k4);
      expect(result).toBe(false);
    });

    it('path of 2 is subgraph of any connected graph', async () => {
      const g = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      const edge = Graph.fromEdges([[0, 1]]);
      const result = await subgraphIsomorphic(g, edge);
      expect(result).toBe(true);
    });

    it('4-cycle contains path of 3 as subgraph', async () => {
      const c4 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ]);
      const p3 = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const result = await subgraphIsomorphic(c4, p3);
      expect(result).toBe(true);
    });
  });

  describe('canonicalPermutation', () => {
    it('returns valid permutation for triangle', async () => {
      const k3 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 0],
      ]);
      const perm = await canonicalPermutation(k3);
      expect(perm).toHaveLength(3);
      // Permutation contains each index exactly once
      const sorted = [...perm].sort((a, b) => a - b);
      expect(sorted).toEqual([0, 1, 2]);
    });

    it('returns valid permutation for path graph', async () => {
      const p4 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      const perm = await canonicalPermutation(p4);
      expect(perm).toHaveLength(4);
      const sorted = [...perm].sort((a, b) => a - b);
      expect(sorted).toEqual([0, 1, 2, 3]);
    });

    it('isomorphic graphs yield same canonical form', async () => {
      const g1 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 0],
      ]);
      const g2 = Graph.fromEdges([
        [0, 2],
        [2, 1],
        [1, 0],
      ]);
      const perm1 = await canonicalPermutation(g1);
      const perm2 = await canonicalPermutation(g2);
      expect(perm1).toEqual(perm2);
    });
  });

  describe('automorphismGroupSize', () => {
    it('K3 has automorphism group of size 6 (3!)', async () => {
      const k3 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 0],
      ]);
      const size = await automorphismGroupSize(k3);
      expect(size).toBe(6);
    });

    it('K4 has automorphism group of size 24 (4!)', async () => {
      const k4 = Graph.fromEdges([
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
      const size = await automorphismGroupSize(k4);
      expect(size).toBe(24);
    });

    it('path of 3 has automorphism group of size 2', async () => {
      // Path 0-1-2 can only be flipped: identity and reverse
      const p3 = Graph.fromEdges([
        [0, 1],
        [1, 2],
      ]);
      const size = await automorphismGroupSize(p3);
      expect(size).toBe(2);
    });

    it('4-cycle has automorphism group of size 8', async () => {
      // Dihedral group D4: 4 rotations + 4 reflections
      const c4 = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ]);
      const size = await automorphismGroupSize(c4);
      expect(size).toBe(8);
    });

    it('single edge has automorphism group of size 2', async () => {
      const g = Graph.fromEdges([[0, 1]]);
      const size = await automorphismGroupSize(g);
      expect(size).toBe(2);
    });
  });
});
