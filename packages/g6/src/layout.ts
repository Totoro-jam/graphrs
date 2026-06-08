import type { LayoutResult } from '@graphrs/core';
import {
  layoutFR,
  layoutKK,
  layoutCircle,
  layoutGrid,
  layoutStar,
  layoutSugiyama,
  layoutRandom,
} from '@graphrs/layout';
import { g6ToGraph, layoutResultToPositions } from './adapters.js';
import type {
  G6GraphData,
  GraphrsLayoutOptions,
  LayoutAlgorithm,
  NodePositionMap,
} from './types.js';

/**
 * Run a graphrs layout algorithm on G6 graph data and return
 * positions keyed by G6 node id.
 */
async function executeLayout(
  data: G6GraphData,
  options?: GraphrsLayoutOptions,
): Promise<NodePositionMap> {
  const { graph } = g6ToGraph(data);
  const algorithm = options?.algorithm ?? 'fruchterman-reingold';
  const nodeIds = data.nodes.map((n) => n.id);

  const layoutResult = await runAlgorithm(graph, algorithm, options);

  return layoutResultToPositions(
    layoutResult,
    nodeIds,
    options?.center,
    options?.width,
    options?.height,
  );
}

async function runAlgorithm(
  graph: import('@graphrs/core').Graph,
  algorithm: LayoutAlgorithm,
  options?: GraphrsLayoutOptions,
): Promise<LayoutResult> {
  switch (algorithm) {
    case 'fruchterman-reingold':
      return layoutFR(graph, { iterations: options?.iterations });
    case 'kamada-kawai':
      return layoutKK(graph);
    case 'circle':
      return layoutCircle(graph);
    case 'grid':
      return layoutGrid(graph);
    case 'star':
      return layoutStar(graph);
    case 'sugiyama':
      return layoutSugiyama(graph);
    case 'random':
      return layoutRandom(graph);
  }
}

/**
 * Create a G6-compatible layout executor.
 *
 * Returns an object with an `execute` method that G6 custom layouts expect.
 * Usage with G6 5.x:
 * ```ts
 * import { Graph } from '@antv/g6';
 * import { createGraphrsLayout } from '@graphrs/g6/layout';
 *
 * const graph = new Graph({
 *   // ... G6 config
 *   layout: createGraphrsLayout({ algorithm: 'fruchterman-reingold' }),
 * });
 * ```
 */
export function createGraphrsLayout(options?: GraphrsLayoutOptions): {
  type: string;
  execute: (data: G6GraphData) => Promise<NodePositionMap>;
} {
  return {
    type: `graphrs-${options?.algorithm ?? 'fruchterman-reingold'}`,
    execute: (data: G6GraphData) => executeLayout(data, options),
  };
}

/**
 * Register all graphrs layouts as named custom layouts with G6.
 *
 * After calling this, you can use layout type strings like
 * `'graphrs-fruchterman-reingold'`, `'graphrs-kamada-kawai'`, etc.
 * in your G6 graph config.
 */
export function registerGraphrsLayouts(
  register: (
    type: string,
    layout: {
      new (options?: GraphrsLayoutOptions): {
        execute: (data: G6GraphData) => Promise<NodePositionMap>;
      };
    },
  ) => void,
): void {
  const algorithms: LayoutAlgorithm[] = [
    'fruchterman-reingold',
    'kamada-kawai',
    'circle',
    'grid',
    'star',
    'sugiyama',
    'random',
  ];

  for (const algorithm of algorithms) {
    const LayoutClass = class GraphrsLayout {
      private options: GraphrsLayoutOptions;
      constructor(opts?: GraphrsLayoutOptions) {
        this.options = { ...opts, algorithm };
      }
      async execute(data: G6GraphData): Promise<NodePositionMap> {
        return executeLayout(data, this.options);
      }
    };

    register(`graphrs-${algorithm}`, LayoutClass);
  }
}

export { executeLayout };
