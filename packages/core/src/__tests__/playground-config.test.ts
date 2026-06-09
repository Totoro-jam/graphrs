import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PLAYGROUND_VUE_PATH = resolve(
  __dirname,
  '../../../../apps/docs/.vitepress/theme/components/Playground.vue',
);

const PLAYGROUND_MD_PATH = resolve(__dirname, '../../../../apps/docs/examples/playground.md');

const PLAYGROUND_ZH_MD_PATH = resolve(__dirname, '../../../../apps/docs/zh/examples/playground.md');

describe('Playground Sandpack configuration', () => {
  const vueContent = readFileSync(PLAYGROUND_VUE_PATH, 'utf-8');
  const mdContent = readFileSync(PLAYGROUND_MD_PATH, 'utf-8');

  it('should NOT depend on @graphrs/core npm package (avoids import.meta.url)', () => {
    expect(vueContent).not.toContain("'@graphrs/core'");
    expect(vueContent).toContain('dependencies: {}');
  });

  it('should provide a local Graph shim file', () => {
    expect(vueContent).toContain('/graphrs-core.js');
    expect(vueContent).toContain('export class Graph');
  });

  it('should have shim with all methods used by demos', () => {
    expect(vueContent).toContain('fromEdges');
    expect(vueContent).toContain('addEdge');
    expect(vueContent).toContain('neighbors');
    expect(vueContent).toContain('degree');
    expect(vueContent).toContain('nodeCount');
    expect(vueContent).toContain('edgeCount');
    expect(vueContent).toContain('nodes()');
    expect(vueContent).toContain('edges()');
    expect(vueContent).toContain('toG6Format');
  });

  it('should NOT contain import.meta in the shim code', () => {
    const shimMatch = vueContent.match(/const graphShimCode = `([\s\S]*?)`;/);
    expect(shimMatch).not.toBeNull();
    const shimCode = shimMatch![1];
    expect(shimCode).not.toContain('import.meta');
  });

  it('demo code should import from local shim, not @graphrs/core', () => {
    expect(mdContent).not.toContain("from '@graphrs/core'");
    expect(mdContent).toContain("from './graphrs-core.js'");
  });

  it('should use vanilla-ts template', () => {
    expect(vueContent).toContain('vanilla-ts');
  });

  it('should enable console output', () => {
    expect(vueContent).toContain('showConsole: true');
  });

  it('should provide /index.html with type="module"', () => {
    expect(vueContent).toContain("'/index.html'");
    expect(vueContent).toContain('type="module"');
  });
});

describe('Playground color safety', () => {
  const mdContent = readFileSync(PLAYGROUND_MD_PATH, 'utf-8');
  const zhContent = readFileSync(PLAYGROUND_ZH_MD_PATH, 'utf-8');

  function findHexAlphaConcatIssues(content: string): string[] {
    const issues: string[] = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.includes("+ '") && /color\s*\+\s*'[0-9a-fA-F]{2}'/.test(line)) {
        const fallbackMatch = line.match(/'#[0-9a-fA-F]{3}'/g);
        if (fallbackMatch) {
          issues.push(`Line ${i + 1}: 3-char hex ${fallbackMatch[0]} used with alpha concat`);
        }
      }
    }
    const fallbackLines = content.match(/\|\|\s*'#[0-9a-fA-F]{3}'/g);
    if (fallbackLines) {
      for (const m of fallbackLines) {
        issues.push(`Fallback with 3-char hex: ${m}`);
      }
    }
    return issues;
  }

  it('English playground should not have 3-char hex fallbacks', () => {
    const issues = findHexAlphaConcatIssues(mdContent);
    expect(issues).toEqual([]);
  });

  it('Chinese playground should not have 3-char hex fallbacks', () => {
    const issues = findHexAlphaConcatIssues(zhContent);
    expect(issues).toEqual([]);
  });

  it('all hex colors used with alpha concat should be 6-char format', () => {
    const colorAssignments = mdContent.matchAll(/const color\s*=\s*[^;]*\|\|\s*'(#[0-9a-fA-F]+)'/g);
    for (const match of colorAssignments) {
      const hex = match[1]!;
      expect(hex.length).toBeGreaterThanOrEqual(7);
    }
  });
});
