import fs from 'node:fs';
import path from 'node:path';
import { isKebabCase } from './naming.js';

export type Source =
  | { type: 'zip'; url: string }
  | { type: 'files' }
  | { type: 'local' };

export interface AssetEntry {
  /** Path within the zip (for `zip` sources) */
  file?: string;
  /** Direct download URL (for `files` sources) */
  url?: string;
  /** Output name (kebab-case). Basename of the svg and react component. */
  output: string;
  /** Override the export name in src/react/index.ts (default: PascalCase) */
  exportName?: string;
  /** Set to false to keep the svg without generating a react component */
  build?: boolean;
  /**
   * Replace the single fill color with `currentColor` so the logo follows
   * the CSS `color` of its surroundings. Only valid for monochrome svgs:
   * optimize skips the asset with an error reason if more than one fill
   * color (or a gradient) is found.
   */
  currentColor?: boolean;
  /**
   * Mark the asset as deprecated: it is still fetched, built and exported,
   * but flagged in `cli assets list` and the preview app (where it can be
   * filtered out). Use when an asset is superseded but still referenced.
   */
  deprecated?: boolean;
}

export interface Org {
  label: string;
  /**
   * Link to the org's official logo/design documentation (design rules,
   * usage guidelines, downloads). Shown as a link in the preview's org
   * group header. Optional.
   */
  docs?: string;
  source: Source;
  assets: AssetEntry[];
}

export interface AssetsConfig {
  orgs: Record<string, Org>;
}

/**
 * An asset is local when its org is local, or when it has neither a
 * `file` (zip member) nor a `url` (download). Local assets have no
 * upstream source: their svg in src/assets is managed by hand and only
 * gets editor junk stripped (never fetched, converted or autocropped).
 */
export function isLocalAsset(org: Org, asset: AssetEntry): boolean {
  return org.source.type === 'local' || (!asset.file && !asset.url);
}

export class ConfigError extends Error {}

export function validateConfig(config: AssetsConfig): string[] {
  const errors: string[] = [];
  const seenOutputs = new Set<string>();

  for (const [orgKey, org] of Object.entries(config.orgs)) {
    if (!isKebabCase(orgKey)) {
      errors.push(`org "${orgKey}": org key must be kebab-case`);
    }
    if (!Array.isArray(org.assets) || org.assets.length === 0) {
      errors.push(`org "${orgKey}": must have at least one asset`);
      continue;
    }
    for (const asset of org.assets) {
      const label = `${orgKey}/${asset.output ?? '(missing output)'}`;
      if (!asset.output || !isKebabCase(asset.output)) {
        errors.push(`asset "${label}": output must be kebab-case`);
        continue;
      }
      if (seenOutputs.has(asset.output)) {
        errors.push(`asset "${label}": duplicate output name`);
      }
      seenOutputs.add(asset.output);

      if (org.source.type === 'zip' && !asset.file && !isLocalAsset(org, asset)) {
        errors.push(
          `asset "${label}": "file" (path within zip) is required for zip sources (or omit both "file" and "url" for a local asset)`,
        );
      }
      if (org.source.type === 'files' && !asset.url && !isLocalAsset(org, asset)) {
        errors.push(
          `asset "${label}": "url" is required for files sources (or omit both "file" and "url" for a local asset)`,
        );
      }
      if (
        org.source.type === 'files' &&
        asset.url?.split('?')[0].endsWith('.zip') &&
        !asset.file
      ) {
        errors.push(
          `asset "${label}": "file" (path within zip) is required when url is a zip`,
        );
      }
      if (asset.exportName && !/^[A-Z][A-Za-z0-9]*$/.test(asset.exportName)) {
        errors.push(`asset "${label}": exportName must be PascalCase`);
      }
    }
  }

  return errors;
}

export function loadConfig(root: string): AssetsConfig {
  const configPath = path.join(root, 'assets.config.json');
  if (!fs.existsSync(configPath)) {
    throw new ConfigError(`No assets.config.json found in ${root}`);
  }
  let config: AssetsConfig;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as AssetsConfig;
  } catch (error) {
    throw new ConfigError(`Could not parse ${configPath}: ${String(error)}`);
  }
  const errors = validateConfig(config);
  if (errors.length > 0) {
    throw new ConfigError(
      `Invalid assets.config.json:\n  - ${errors.join('\n  - ')}`,
    );
  }
  return config;
}

/** All assets across orgs, keyed by output name */
export function allAssets(config: AssetsConfig): Map<string, AssetEntry> {
  const map = new Map<string, AssetEntry>();
  for (const org of Object.values(config.orgs)) {
    for (const asset of org.assets) {
      map.set(asset.output, asset);
    }
  }
  return map;
}
