import fs from 'node:fs';
import path from 'node:path';
import { transform } from '@svgr/core';
import { format as prettierFormat, resolveConfig } from 'prettier';
import type { Ctx } from './paths.js';
import { assetsDir, reactDir, reactPath, svgPath } from './paths.js';
import { allAssets } from './config.js';
import { pascalCase } from './naming.js';
import { fileHash, sha256 } from './fs-utils.js';
import type { ChangeStatus } from './fetch.js';

export interface BuildReport {
  components: { output: string; status: ChangeStatus }[];
  /** Managed assets without an svg source; existing tsx is kept as-is */
  reactOnly: string[];
  /** Configured assets with neither an svg nor a component (not fetched?) */
  missing: string[];
  /** svgs in src/assets that are not managed by the config */
  unmanaged: string[];
  /** tsx files in src/react that are not managed by the config */
  unknownComponents: string[];
  indexStatus: ChangeStatus;
}

const SVGR_OPTIONS = {
  // @svgr/core v8 has no default plugins — the jsx plugin must be listed
  // explicitly (svgo is skipped: svgs are already optimized).
  plugins: ['@svgr/plugin-jsx'],
  typescript: true,
  memo: true,
  ref: true,
  // svgs in src/assets are already optimized by the `optimize` step
  svgo: false,
  // formatting is done with the repo's prettier below
  prettier: false,
  dimensions: false,
};

/** Format generated code with the same prettier config the repo uses. */
async function formatCode(code: string, filepath: string): Promise<string> {
  const config = (await resolveConfig(filepath)) ?? {};
  return prettierFormat(code, { ...config, parser: 'typescript' });
}

export function exportNameFor(
  output: string,
  exportNameOverride?: string,
): string {
  return exportNameOverride ?? pascalCase(output);
}

export async function buildComponents(ctx: Ctx): Promise<BuildReport> {
  const managed = allAssets(ctx.config);
  const report: BuildReport = {
    components: [],
    reactOnly: [],
    missing: [],
    unmanaged: [],
    unknownComponents: [],
    indexStatus: 'unchanged',
  };

  // 1. Generate react components from svgs
  for (const [output, asset] of managed) {
    if (asset.build === false) continue;

    const svg = svgPath(ctx, output);
    if (!fs.existsSync(svg)) {
      if (fs.existsSync(reactPath(ctx, output))) {
        report.reactOnly.push(output);
      } else {
        report.missing.push(output);
      }
      continue;
    }

    const svgCode = fs.readFileSync(svg, 'utf8');
    const dest = reactPath(ctx, output);
    const transformed = await transform(svgCode, SVGR_OPTIONS, {
      filePath: path.basename(svg),
    });
    const jsCode = await formatCode(transformed, dest);
    const data = Buffer.from(jsCode);
    const status: ChangeStatus =
      fileHash(dest) === sha256(data)
        ? 'unchanged'
        : fs.existsSync(dest)
          ? 'updated'
          : 'new';
    if (status !== 'unchanged') fs.writeFileSync(dest, data);
    report.components.push({ output, status });
  }

  // 2. Report svgs/components outside the config
  for (const file of fs.readdirSync(assetsDir(ctx))) {
    if (!file.endsWith('.svg')) continue;
    const output = path.basename(file, '.svg');
    if (!managed.has(output)) report.unmanaged.push(output);
  }

  // 3. Regenerate src/react/index.ts
  const exportNames = new Map<string, string>();
  for (const file of fs.readdirSync(reactDir(ctx))) {
    if (!file.endsWith('.tsx')) continue;
    const output = path.basename(file, '.tsx');
    const asset = managed.get(output);
    if (!asset) {
      report.unknownComponents.push(output);
    }
    exportNames.set(output, exportNameFor(output, asset?.exportName));
  }

  const lines = [...exportNames.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([output, name]) => `export { default as ${name} } from './${output}';`,
    );
  const indexPath = path.join(reactDir(ctx), 'index.ts');
  const indexCode = await formatCode(`${lines.join('\n')}\n`, indexPath);
  const indexStatus: ChangeStatus =
    fileHash(indexPath) === sha256(indexCode)
      ? 'unchanged'
      : fs.existsSync(indexPath)
        ? 'updated'
        : 'new';
  if (indexStatus !== 'unchanged') fs.writeFileSync(indexPath, indexCode);
  report.indexStatus = indexStatus;

  return report;
}
