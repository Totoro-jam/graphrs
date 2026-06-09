import { describe, it, expect } from 'vitest';
import { createGraphrsLayout, registerGraphrsLayouts, executeLayout } from '../layout.js';
import type { G6GraphData } from '../types.js';

const sampleData: G6GraphData = {
  nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
  edges: [
    { source: 'a', target: 'b' },
    { source: 'b', target: 'c' },
  ],
};

describe('createGraphrsLayout', () => {
  it('should return an object with type and execute', () => {
    const layout = createGraphrsLayout({ algorithm: 'circle' });
    expect(layout.type).toBe('graphrs-circle');
    expect(typeof layout.execute).toBe('function');
  });

  it('should default to fruchterman-reingold', () => {
    const layout = createGraphrsLayout();
    expect(layout.type).toBe('graphrs-fruchterman-reingold');
  });

  it('should use the specified algorithm in type name', () => {
    const layout = createGraphrsLayout({ algorithm: 'kamada-kawai' });
    expect(layout.type).toBe('graphrs-kamada-kawai');
  });

  it('execute should return positions for all nodes', async () => {
    const layout = createGraphrsLayout({ algorithm: 'circle' });
    const positions = await layout.execute(sampleData);
    expect(positions).toHaveProperty('a');
    expect(positions).toHaveProperty('b');
    expect(positions).toHaveProperty('c');
    expect(typeof positions['a']!.x).toBe('number');
    expect(typeof positions['a']!.y).toBe('number');
  });
});

describe('executeLayout', () => {
  it('should be an async function that resolves', async () => {
    const positions = await executeLayout(sampleData, { algorithm: 'grid' });
    expect(positions).toHaveProperty('a');
    expect(positions).toHaveProperty('b');
    expect(positions).toHaveProperty('c');
  });

  it('should return numeric x/y for each node', async () => {
    const positions = await executeLayout(sampleData, { algorithm: 'circle' });
    for (const nodeId of ['a', 'b', 'c']) {
      expect(typeof positions[nodeId]!.x).toBe('number');
      expect(typeof positions[nodeId]!.y).toBe('number');
      expect(Number.isFinite(positions[nodeId]!.x)).toBe(true);
      expect(Number.isFinite(positions[nodeId]!.y)).toBe(true);
    }
  });

  it('should default to fruchterman-reingold', async () => {
    const positions = await executeLayout(sampleData);
    expect(Object.keys(positions)).toHaveLength(3);
  });

  it('should respect width and height options', async () => {
    const positions = await executeLayout(sampleData, {
      algorithm: 'circle',
      width: 800,
      height: 600,
      center: [400, 300],
    });
    for (const nodeId of ['a', 'b', 'c']) {
      expect(positions[nodeId]!.x).toBeGreaterThanOrEqual(0);
      expect(positions[nodeId]!.x).toBeLessThanOrEqual(800);
      expect(positions[nodeId]!.y).toBeGreaterThanOrEqual(0);
      expect(positions[nodeId]!.y).toBeLessThanOrEqual(600);
    }
  });
});

describe('registerGraphrsLayouts', () => {
  it('should register all 7 layout algorithms', () => {
    const registered: string[] = [];
    const mockRegister = (type: string) => {
      registered.push(type);
    };

    registerGraphrsLayouts(mockRegister as Parameters<typeof registerGraphrsLayouts>[0]);

    expect(registered).toHaveLength(7);
    expect(registered).toContain('graphrs-fruchterman-reingold');
    expect(registered).toContain('graphrs-kamada-kawai');
    expect(registered).toContain('graphrs-circle');
    expect(registered).toContain('graphrs-grid');
    expect(registered).toContain('graphrs-star');
    expect(registered).toContain('graphrs-sugiyama');
    expect(registered).toContain('graphrs-random');
  });

  it('should register classes with working execute method', () => {
    const layouts: Record<string, new () => { execute: (data: G6GraphData) => Promise<unknown> }> =
      {};
    const mockRegister = (type: string, cls: (typeof layouts)[string]) => {
      layouts[type] = cls;
    };

    registerGraphrsLayouts(mockRegister as Parameters<typeof registerGraphrsLayouts>[0]);
    expect(Object.keys(layouts)).toHaveLength(7);

    const CircleLayout = layouts['graphrs-circle']!;
    const instance = new CircleLayout();
    expect(typeof instance.execute).toBe('function');
  });
});
