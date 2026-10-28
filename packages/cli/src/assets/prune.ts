import fs from 'node:fs';
import path from 'node:path';
import type { Ctx } from './paths.js';
import { assetsDir, reactDir } from './paths.js';
import { allAssets } from './config.js';

export interface PruneReport {
  /** Orphaned svgs in src/assets, as repo-relative paths */
  svgs: string[];
  /** Orphaned components in src/react, as repo-relative paths */
  components: string[];
  deleted: boolean;
}

/**
 * Files that exist in the package but are not managed by the config:
 * the inverse of the update report. These are what the preview badges
 * as "not in config" and what `build` reports as unmanaged/unknown.
 */
export function findOrphans(ctx: Ctx): {
  svgs: string[];
  components: string[];
} {
  const managed = allAssets(ctx.config);
  const svgs: string[] = [];
  const components: string[] = [];

  if (fs.existsSync(assetsDir(ctx))) {
    for (const file of fs.readdirSync(assetsDir(ctx))) {
      if (!file.endsWith('.svg')) continue;
      const output = path.basename(file, '.svg');
      if (!managed.has(output)) svgs.push(`src/assets/${file}`);
    }
  }

  if (fs.existsSync(reactDir(ctx))) {
    for (const file of fs.readdirSync(reactDir(ctx))) {
      if (!file.endsWith('.tsx')) continue;
      const output = path.basename(file, '.tsx');
      if (!managed.has(output)) components.push(`src/react/${file}`);
    }
  }

  return { svgs, components };
}

/**
 * Delete the orphaned files. The caller is responsible for regenerating
 * `src/react/index.ts` afterwards (`build` does that): the index only
 * exports configured assets, but stale component files would otherwise
 * linger in it.
 */
export function pruneAssets(ctx: Ctx): PruneReport {
  const { svgs, components } = findOrphans(ctx);
  for (const rel of [...svgs, ...components]) {
    fs.unlinkSync(path.join(ctx.root, rel));
  }
  return { svgs, components, deleted: true };
}
