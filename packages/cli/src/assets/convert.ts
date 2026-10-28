import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { optimize } from 'svgo';
import type { Ctx } from './paths.js';
import { sourceDir } from './paths.js';
import { isLocalAsset } from './config.js';

export interface ConvertReport {
  org: string;
  converted: { output: string; from: string; tool: string }[];
  skipped: { output: string; reason: string }[];
}

/**
 * svgo plugin that strips editor metadata (inkscape/sodipodi, Adobe
 * namespaces, CMYK color profiles) which the assets svgo config and
 * react's svg typings cannot handle.
 */
export function createStripJunkPlugin(opts: {
  removeIds: boolean;
  removeXlinkNs?: boolean;
}) {
  const junkElements = new Set([
    'sodipodi:namedview',
    'inkscape:page',
    'metadata',
    'color-profile',
    // inkscape sometimes emits these without the namespace prefix
    'namedview',
    'page',
    'rdf:RDF',
    'cc:Work',
    'cc:License',
  ]);
  const junkAttrPrefixes = ['sodipodi:', 'inkscape:'];
  const junkAttrs = new Set([
    'xmlns:sodipodi',
    'xmlns:inkscape',
    'xmlns:svg',
    'xmlns:dc',
    'xmlns:cc',
    'xmlns:rdf',
    'xmlns:serif',
    'version',
    // Deprecated SVG 1.0 hint, emitted by Adobe Illustrator; react's
    // svg typings reject it.
    'enableBackground',
    'enable-background',
  ]);
  if (opts.removeXlinkNs) junkAttrs.add('xmlns:xlink');
  return {
    name: 'stripEditorJunk',
    type: 'visitor' as const,
    fn: () => ({
      element: {
        enter(node: any) {
          if (junkElements.has(node.name)) {
            node.type = 'remove';
            return;
          }
          for (const attr of Object.keys(node.attributes ?? {})) {
            if (
              junkAttrs.has(attr) ||
              junkAttrPrefixes.some((prefix) => attr.startsWith(prefix)) ||
              (opts.removeIds && attr === 'id')
            ) {
              delete node.attributes[attr];
            }
          }
        },
        exit(node: any) {
          // Drop defs that became empty after removing color profiles etc.
          if (node.name === 'defs' && (node.children ?? []).length === 0) {
            node.type = 'remove';
          }
        },
      },
    }),
  };
}

export function hasTool(tool: string): boolean {
  const result = spawnSync(tool, ['--version'], { encoding: 'utf8' });
  return result.status === 0;
}

/**
 * Whether a binary exists on PATH. Some tools (e.g. ps2pdf, a ghostscript
 * shell wrapper) exit non-zero for --version or even no arguments, so
 * existence is checked via the spawn error instead of the exit code.
 */
export function hasBinary(tool: string): boolean {
  const result = spawnSync(tool, []);
  return !result.error;
}

function run(tool: string, args: string[]): void {
  const result = spawnSync(tool, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${tool} ${args.join(' ')} failed:\n${result.stderr}`);
  }
}

function convertPdf(input: string, output: string): string {
  if (hasTool('inkscape')) {
    run('inkscape', [
      '--export-type=svg',
      `--export-filename=${output}`,
      input,
    ]);
    return 'inkscape';
  }
  if (hasTool('pdftocairo')) {
    run('pdftocairo', ['-svg', input, output]);
    return 'pdftocairo';
  }
  throw new Error(
    'Neither inkscape nor pdftocairo is available for pdf/eps conversion. Install inkscape: brew install inkscape',
  );
}

/**
 * PostScript flavors (.ps and .eps) go through ghostscript first:
 * ps2pdf flattens them to pdf. poppler (`pdftocairo`) then converts to
 * svg — inkscape's import drops the artwork or fails for these files,
 * so pdftocairo is preferred here.
 *
 * `-dEPSCrop` makes ghostscript size the pdf page after the EPS
 * `%%BoundingBox` instead of a default media size (e.g. Letter). Some
 * published logos are wider than the default media — without this flag
 * the rightmost artwork is silently clipped (fritt-ord lockups lost
 * their trailing "rd" this way).
 */
function convertPs(input: string, output: string): string {
  if (!hasBinary('ps2pdf')) {
    throw new Error(
      'ps2pdf (ghostscript) is not available for .ps conversion. Install ghostscript: brew install ghostscript',
    );
  }
  const pdf = output.replace(/\.svg$/, '.pdf');
  run('ps2pdf', ['-dEPSCrop', input, pdf]);
  // pdftocairo exits non-zero for --version, so probe for existence
  if (hasBinary('pdftocairo')) {
    run('pdftocairo', ['-svg', pdf, output]);
    return 'ps2pdf+pdftocairo';
  }
  convertPdf(pdf, output);
  return 'ps2pdf+inkscape';
}

export async function convertOrg(
  ctx: Ctx,
  orgKey: string,
): Promise<ConvertReport> {
  const org = ctx.config.orgs[orgKey];
  if (!org) throw new Error(`Unknown org: ${orgKey}`);

  const report: ConvertReport = { org: orgKey, converted: [], skipped: [] };
  if (org.source.type === 'local') {
    report.skipped.push({
      output: '(all)',
      reason: 'local org: no upstream sources',
    });
    return report;
  }

  const destDir = sourceDir(ctx, orgKey);

  for (const asset of org.assets) {
    if (isLocalAsset(org, asset)) {
      report.skipped.push({
        output: asset.output,
        reason: 'local asset: hand-managed in src/assets',
      });
      continue;
    }
    const sourceRef = asset.file ?? asset.url!;
    const basename = path.basename(sourceRef);
    const sourcePath = path.join(destDir, basename);
    const stagePath = path.join(ctx.stageDir, `${asset.output}.svg`);

    if (!fs.existsSync(sourcePath)) {
      report.skipped.push({
        output: asset.output,
        reason: `source file not fetched: ${basename} (run fetch first)`,
      });
      continue;
    }

    const ext = path.extname(basename).toLowerCase();
    if (ext === '.svg') {
      // Strip editor junk (inkscape/sodipodi, Adobe namespaces, metadata)
      // so the optimize step and generated components get clean input.
      // Ids are kept: prefixIds in the svgo config scopes them per file.
      const raw = fs.readFileSync(sourcePath, 'utf8');
      const cleaned = optimize(raw, {
        plugins: [createStripJunkPlugin({ removeIds: false })],
      });
      fs.writeFileSync(stagePath, cleaned.data);
      report.converted.push({
        output: asset.output,
        from: basename,
        tool: 'copy',
      });
      continue;
    }

    if (ext === '.pdf' || ext === '.ai') {
      const tool = convertPdf(sourcePath, stagePath);
      // Strip inkscape/sodipodi metadata before optimization
      const raw = fs.readFileSync(stagePath, 'utf8');
      const cleaned = optimize(raw, {
        plugins: [createStripJunkPlugin({ removeIds: true })],
      });
      fs.writeFileSync(stagePath, cleaned.data);
      report.converted.push({ output: asset.output, from: basename, tool });
      continue;
    }

    // PostScript flavors (.ps and .eps) share the ghostscript path:
    // inkscape cannot open them directly (its import drops the artwork
    // or fails outright), so ps2pdf flattens and pdftocairo converts.
    if (ext === '.ps' || ext === '.eps') {
      const tool = convertPs(sourcePath, stagePath);
      // Strip inkscape/sodipodi metadata before optimization
      const raw = fs.readFileSync(stagePath, 'utf8');
      const cleaned = optimize(raw, {
        plugins: [createStripJunkPlugin({ removeIds: true })],
      });
      fs.writeFileSync(stagePath, cleaned.data);
      report.converted.push({ output: asset.output, from: basename, tool });
      continue;
    }

    report.skipped.push({
      output: asset.output,
      reason: `unsupported source format: ${ext}`,
    });
  }

  return report;
}
