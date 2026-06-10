import { describe, it, expect } from 'vitest';
import { executeLayout } from '../use-graphrs-layout.js';
import type { LayoutAlgorithm } from '../types.js';

const nodes = [
  { id: 'a', position: { x: 0, y: 0 }, data: { label: 'A' } },
  { id: 'b', position: { x: 0, y: 0 }, data: { label: 'B' } },
  { id: 'c', position: { x: 0, y: 0 }, data: { label: 'C' } },
  { id: 'd', position: { x: 0, y: 0 }, data: { label: 'D' } },
];

const edges = [
  { id: 'e1', source: 'a', target: 'b' },
  { id: 'e2', source: 'b', target: 'c' },
  { id: 'e3', source: 'c', target: 'd' },
  { id: 'e4', source: 'd', target: 'a' },
];

describe('executeLayout', () => {
  const algorithms: LayoutAlgorithm[] = [
    'fruchterman-reingold',
    'kamada-kawai',
    'circle',
    'grid',
    'star',
    'random',
  ];

  for (const algo of algorithms) {
    it(`${algo}: returns nodes with updated positions`, async () => {
      const result = await executeLayout(nodes, edges, algo);
      expect(result).toHaveLength(4);
      for (const node of result) {
        expect(node.position).toBeDefined();
        expect(typeof node.position.x).toBe('number');
        expect(typeof node.position.y).toBe('number');
        expect(Number.isFinite(node.position.x)).toBe(true);
        expect(Number.isFinite(node.position.y)).toBe(true);
      }
    });
  }

  it('preserves node IDs and data', async () => {
    const result = await executeLayout(nodes, edges, 'circle');
    expect(result[0]!.id).toBe('a');
    expect(result[0]!.data).toEqual({ label: 'A' });
    expect(result[3]!.id).toBe('d');
    expect(result[3]!.data).toEqual({ label: 'D' });
  });

  it('produces distinct positions for different nodes', async () => {
    const result = await executeLayout(nodes, edges, 'circle');
    const positions = result.map((n) => `${n.position.x},${n.position.y}`);
    const unique = new Set(positions);
    expect(unique.size).toBe(4);
  });

  it('respects iterations option for fruchterman-reingold', async () => {
    const result = await executeLayout(nodes, edges, 'fruchterman-reingold', 10);
    expect(result).toHaveLength(4);
    for (const node of result) {
      expect(Number.isFinite(node.position.x)).toBe(true);
    }
  });

  it('handles empty node list', async () => {
    const result = await executeLayout([], [], 'circle');
    expect(result).toHaveLength(0);
  });

  it('handles single node', async () => {
    const single = [{ id: 'solo', position: { x: 0, y: 0 }, data: {} }];
    const result = await executeLayout(single, [], 'circle');
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('solo');
  });
});
