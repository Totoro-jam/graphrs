import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'graphrs',
  description:
    'Modular TypeScript graph library powered by Rust/WASM — 400+ algorithms at native speed',
  base: '/graphrs/',
  sitemap: { hostname: 'https://totoro-jam.github.io/graphrs' },
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/graphrs/favicon.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'graphrs — Graph Algorithms at Native Speed' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'The igraph for JavaScript — 400+ graph algorithms powered by Rust/WASM. Community detection, centrality, layout, flow, isomorphism. Tree-shakable. TypeScript.',
      },
    ],
    ['meta', { property: 'og:url', content: 'https://totoro-jam.github.io/graphrs/' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'graphrs — Graph Algorithms at Native Speed' }],
    [
      'meta',
      {
        name: 'twitter:description',
        content:
          '400+ graph algorithms at native speed. Rust/WASM. TypeScript. Browser & Node.js.',
      },
    ],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'API', link: '/api/core' },
          { text: 'Examples', link: '/examples/playground' },
        ],

        sidebar: {
          '/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Getting Started', link: '/guide/getting-started' },
                { text: 'Graph Basics', link: '/guide/graph-basics' },
                { text: 'Algorithms', link: '/guide/algorithms' },
                { text: 'WASM & Licensing', link: '/guide/wasm' },
              ],
            },
          ],
          '/api/': [
            {
              text: 'API Reference',
              items: [
                { text: 'Core', link: '/api/core' },
                { text: 'Community', link: '/api/community' },
                { text: 'Centrality', link: '/api/centrality' },
                { text: 'Path', link: '/api/path' },
                { text: 'Layout', link: '/api/layout' },
                { text: 'Generators', link: '/api/generators' },
                { text: 'I/O', link: '/api/io' },
                { text: 'Operators', link: '/api/operators' },
                { text: 'Flow', link: '/api/flow' },
                { text: 'Isomorphism', link: '/api/isomorphism' },
                { text: 'G6 Integration', link: '/api/g6' },
                { text: 'React Flow', link: '/api/react-flow' },
              ],
            },
          ],
          '/examples/': [
            {
              text: 'Interactive Playground',
              items: [
                { text: 'Force Layout Animation', link: '/examples/playground#force-directed-layout-live-convergence' },
                { text: 'Community Detection', link: '/examples/playground#community-detection' },
                { text: 'Betweenness Centrality', link: '/examples/playground#betweenness-centrality' },
                { text: 'PageRank', link: '/examples/playground#pagerank' },
                { text: 'Graph Generators', link: '/examples/playground#graph-generators' },
                { text: 'Performance Benchmark', link: '/examples/playground#performance-benchmark' },
                { text: 'G6 Layout Pipeline', link: '/examples/playground#g6-layout-community-pipeline' },
                { text: 'React Flow Auto-Layout', link: '/examples/playground#react-flow-instant-hierarchical-layout' },
              ],
            },
            {
              text: 'Integration Guides',
              items: [
                { text: 'AntV G6', link: '/examples/antv-g6' },
                { text: 'React Flow', link: '/examples/react-flow' },
                { text: 'Cytoscape.js', link: '/examples/cytoscape' },
                { text: 'D3 Force', link: '/examples/d3-force' },
                { text: 'Node.js Backend', link: '/examples/node-backend' },
              ],
            },
          ],
        },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      description: '模块化 TypeScript 图算法库，由 Rust/WASM 驱动 — 400+ 算法，原生速度',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/getting-started' },
          { text: 'API', link: '/zh/api/core' },
          { text: '示例', link: '/zh/examples/playground' },
        ],

        sidebar: {
          '/zh/guide/': [
            {
              text: '指南',
              items: [
                { text: '快速开始', link: '/zh/guide/getting-started' },
                { text: '图基础', link: '/zh/guide/graph-basics' },
                { text: '算法概览', link: '/zh/guide/algorithms' },
                { text: 'WASM 与许可', link: '/zh/guide/wasm' },
              ],
            },
          ],
          '/zh/api/': [
            {
              text: 'API 参考',
              items: [
                { text: '核心', link: '/zh/api/core' },
                { text: '社区检测', link: '/zh/api/community' },
                { text: '中心性', link: '/zh/api/centrality' },
                { text: '最短路径', link: '/zh/api/path' },
                { text: '布局', link: '/zh/api/layout' },
                { text: '图生成器', link: '/zh/api/generators' },
                { text: '导入导出', link: '/zh/api/io' },
                { text: '图变换', link: '/zh/api/operators' },
                { text: '网络流', link: '/zh/api/flow' },
                { text: '同构', link: '/zh/api/isomorphism' },
                { text: 'G6 集成', link: '/zh/api/g6' },
                { text: 'React Flow', link: '/zh/api/react-flow' },
              ],
            },
          ],
          '/zh/examples/': [
            {
              text: '交互式演练场',
              items: [
                { text: '力导向布局动画', link: '/zh/examples/playground#力导向布局-—-实时收敛' },
                { text: '社区发现', link: '/zh/examples/playground#社区发现' },
                { text: '介数中心性', link: '/zh/examples/playground#介数中心性' },
                { text: 'PageRank', link: '/zh/examples/playground#pagerank' },
                { text: '图生成器', link: '/zh/examples/playground#图生成器' },
                { text: '性能基准测试', link: '/zh/examples/playground#性能基准测试' },
                { text: 'G6 布局管线', link: '/zh/examples/playground#g6-—-布局-社区检测管线' },
                { text: 'React Flow 分层布局', link: '/zh/examples/playground#react-flow-—-即时分层布局' },
              ],
            },
            {
              text: '集成指南',
              items: [
                { text: 'AntV G6', link: '/zh/examples/antv-g6' },
                { text: 'React Flow', link: '/zh/examples/react-flow' },
                { text: 'Cytoscape.js', link: '/zh/examples/cytoscape' },
                { text: 'D3 Force', link: '/zh/examples/d3-force' },
                { text: 'Node.js 后端', link: '/zh/examples/node-backend' },
              ],
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Totoro-jam/graphrs' },
      { icon: 'npm', link: 'https://www.npmjs.com/org/graphrs' },
    ],

    search: { provider: 'local' },

    footer: {
      message: 'MIT License (TS code) · GPL-2.0 (WASM binary)',
      copyright: 'Copyright © 2026-present Totoro-jam',
    },
  },
});
