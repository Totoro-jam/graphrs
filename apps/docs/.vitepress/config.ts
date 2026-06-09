import { defineConfig } from 'vitepress';
import container from 'markdown-it-container';
import { renderSandbox } from 'vitepress-plugin-sandpack';

export default defineConfig({
  markdown: {
    config(md) {
      md.use(container, 'sandbox', {
        render(
          tokens: { nesting: number; info: string; attrs: [string, string][] | null }[],
          idx: number,
        ) {
          const token = tokens[idx]!;
          if (token.nesting === 1) {
            const match = token.info.match(/\btemplate=(\S+)/);
            if (match) {
              token.attrs = token.attrs || [];
              token.attrs.push(['template', match[1]!.replace(/[{}]/g, '')]);
            }
          }
          return renderSandbox(tokens, idx, 'sandbox');
        },
      });
    },
  },
  title: 'graphrs',
  description:
    'Modular TypeScript graph library powered by Rust/WASM — 400+ algorithms at native speed',
  base: '/graphrs/',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/graphrs/logo.svg' }]],

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
              ],
            },
          ],
          '/examples/': [
            {
              text: 'Interactive',
              items: [{ text: 'Playground', link: '/examples/playground' }],
            },
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
              ],
            },
          ],
          '/zh/examples/': [
            {
              text: '交互式',
              items: [{ text: '演练场', link: '/zh/examples/playground' }],
            },
            {
              text: '集成示例',
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
      copyright: 'Copyright © 2024-present Totoro-jam',
    },
  },
});
