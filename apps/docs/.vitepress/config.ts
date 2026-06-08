import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'graphrs',
  description: 'Modular TypeScript graph library powered by Rust/WASM — 400+ algorithms at native speed',
  base: '/graphrs/',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/graphrs/logo.svg' }]],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: 'Examples', link: '/examples/antv-g6' },
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
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Integration Examples',
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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Totoro-jam/graphrs' },
      { icon: 'npm', link: 'https://www.npmjs.com/org/graphrs' },
    ],

    search: { provider: 'local' },

    footer: {
      message: 'MIT License (TS code) · GPL-2.0 (WASM binary)',
      copyright: 'Copyright © 2024-present Totoro-jam',
    },
  },
});
