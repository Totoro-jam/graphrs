import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PLAYGROUND_PATH = resolve(
  __dirname,
  '../../../../apps/docs/.vitepress/theme/components/Playground.vue',
);

describe('Playground Sandpack configuration', () => {
  const content = readFileSync(PLAYGROUND_PATH, 'utf-8');

  it('should use type="module" in HTML to support import.meta', () => {
    expect(content).toContain('type="module"');
  });

  it('should provide /index.html override', () => {
    expect(content).toContain("'/index.html'");
  });

  it('should use /index.ts as entry point (vanilla-ts template)', () => {
    expect(content).toContain("'/index.ts'");
  });

  it('should reference @graphrs/core dependency', () => {
    expect(content).toContain('@graphrs/core');
  });

  it('should use vanilla-ts template', () => {
    expect(content).toContain('vanilla-ts');
  });

  it('should enable console output', () => {
    expect(content).toContain('showConsole: true');
  });
});
