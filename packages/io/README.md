# @graphrs/io

> Import and export graphs in standard file formats.

[![npm](https://img.shields.io/npm/v/@graphrs/io)](https://www.npmjs.com/package/@graphrs/io)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/core @graphrs/io
```

## Usage

```typescript
import { Graph } from '@graphrs/core';
import { readGraphML, writeGraphML } from '@graphrs/io';

// Import
const g = await readGraphML(graphmlString);

// Export
const xml = await writeGraphML(g);
```

## Functions

| Function | Description |
|----------|-------------|
| `readGraphML(data)` / `writeGraphML(graph)` | GraphML (XML-based) |
| `readGML(data)` / `writeGML(graph)` | GML format |
| `readDOT(data)` / `writeDOT(graph)` | DOT (Graphviz) |
| `readEdgeList(data)` / `writeEdgeList(graph)` | Edge list (text) |
| `readPajek(data)` / `writePajek(graph)` | Pajek .net format |

## Part of @graphrs

[@graphrs](https://github.com/Totoro-jam/graphrs) — modular TypeScript graph library powered by Rust/WASM.

[Full documentation](https://totoro-jam.github.io/graphrs/api/io) | [GitHub](https://github.com/Totoro-jam/graphrs)
