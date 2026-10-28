import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { createCtx } from './paths.js';
import { findOrphans, pruneAssets } from './prune.js';

function makeFixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'assets-prune-'));
  mkdirSync(path.join(root, 'src', 'assets'), { recursive: true });
  mkdirSync(path.join(root, 'src', 'react'), { recursive: true });
  writeFileSync(
    path.join(root, 'assets.config.json'),
    JSON.stringify({
      orgs: {
        uib: {
          label: 'Test',
          source: { type: 'local' },
          assets: [{ output: 'uib-lockup-no' }],
        },
      },
    }),
  );
  // managed files
  writeFileSync(path.join(root, 'src', 'assets', 'uib-lockup-no.svg'), '<svg/>');
  writeFileSync(path.join(root, 'src', 'react', 'uib-lockup-no.tsx'), 'export {}');
  // orphaned files
  writeFileSync(path.join(root, 'src', 'assets', 'removed-logo.svg'), '<svg/>');
  writeFileSync(path.join(root, 'src', 'react', 'removed-logo.tsx'), 'export {}');
  // files that must never be touched
  writeFileSync(path.join(root, 'src', 'react', 'index.ts'), "export {}");
  writeFileSync(path.join(root, 'src', 'assets', 'notes.txt'), 'not an svg');
  return root;
}

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

describe('prune', () => {
  it('finds orphaned svgs and components, ignoring other files', () => {
    const root = makeFixture();
    roots.push(root);
    const ctx = createCtx(root);

    const { svgs, components } = findOrphans(ctx);
    expect(svgs).toEqual(['src/assets/removed-logo.svg']);
    expect(components).toEqual(['src/react/removed-logo.tsx']);
  });

  it('deletes only the orphans', () => {
    const root = makeFixture();
    roots.push(root);
    const ctx = createCtx(root);

    const report = pruneAssets(ctx);
    expect(report.deleted).toBe(true);
    expect(existsSync(path.join(root, 'src', 'assets', 'removed-logo.svg'))).toBe(false);
    expect(existsSync(path.join(root, 'src', 'react', 'removed-logo.tsx'))).toBe(false);
    // managed + unrelated files survive
    expect(existsSync(path.join(root, 'src', 'assets', 'uib-lockup-no.svg'))).toBe(true);
    expect(existsSync(path.join(root, 'src', 'react', 'uib-lockup-no.tsx'))).toBe(true);
    expect(existsSync(path.join(root, 'src', 'react', 'index.ts'))).toBe(true);
    expect(existsSync(path.join(root, 'src', 'assets', 'notes.txt'))).toBe(true);
  });

  it('is a no-op when there is nothing to prune', () => {
    const root = makeFixture();
    roots.push(root);
    const ctx = createCtx(root);

    pruneAssets(ctx);
    const second = pruneAssets(ctx);
    expect(second.svgs).toEqual([]);
    expect(second.components).toEqual([]);
  });
});
