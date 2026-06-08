---
layout: home

hero:
  name: graphrs
  text: 原生速度的图算法
  tagline: 模块化、可摇树的 TypeScript 图算法库，由 Rust/WASM 驱动。400+ 算法，支持浏览器和 Node.js。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/Totoro-jam/graphrs

features:
  - title: 400+ 算法
    details: 社区检测、中心性、最短路径、布局、图生成器、导入导出、网络流、同构 —— 全部通过 WASM 调用 igraph 实现。
  - title: 可摇树优化
    details: 按需引入。每个算法族都在独立的包中 —— 你的构建产物只会包含你实际使用的函数。
  - title: TypeScript 优先
    details: 完整的类型安全，包括类型化的选项、结果和 Graph 泛型。库代码中没有 `any` 类型。
  - title: 原生性能
    details: Rust/WASM 内核为重量级图计算提供接近原生的速度，直接在浏览器或 Node.js 运行时中运行。
  - title: 框架就绪
    details: 内置 AntV G6、React Flow 和 Cytoscape.js 的序列化器。将图算法结果直接接入你的可视化方案。
  - title: 双端支持
    details: 在浏览器和 Node.js 中无缝运行。自动环境检测和 WASM 加载。
---
