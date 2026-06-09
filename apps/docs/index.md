---
layout: home

hero:
  name: graphrs
  text: Graph Algorithms at Native Speed
  tagline: Modular, tree-shakable TypeScript graph library powered by Rust/WASM. 400+ algorithms, browser & Node.js.
  image:
    light: /logo.svg
    dark: /logo.svg
    alt: graphrs logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Try in Browser
      link: /examples/playground
    - theme: alt
      text: GitHub
      link: https://github.com/Totoro-jam/graphrs

features:
  - title: 400+ Algorithms
    details: Community detection, centrality, shortest paths, layouts, graph generators, I/O, flow, isomorphism — all backed by rust-igraph via WASM.
  - title: Tree-Shakable
    details: Import only what you need. Each algorithm family lives in its own package — your bundle only includes the functions you use.
  - title: TypeScript First
    details: Full type safety with typed options, results, and Graph generics. No `any` types in library code.
  - title: Native Performance
    details: Rust/WASM core delivers near-native speed for heavy graph computations, right in your browser or Node.js runtime.
  - title: Framework Ready
    details: Built-in serializers for AntV G6, React Flow, and Cytoscape.js. Plug graph results directly into your visualization.
  - title: Dual Environment
    details: Works seamlessly in both browser and Node.js. Automatic environment detection and WASM loading.
---
