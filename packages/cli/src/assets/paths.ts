import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import type { AssetsConfig } from "./config.js";
import { loadConfig } from "./config.js";

/**
 * Location of the assets package this CLI operates on.
 *
 * Resolved relative to this file so it works both when running from
 * `src/` (via tsx) and from `dist/` (compiled):
 * `packages/cli/{src|dist}/assets/ -> ../../../assets`
 */
export function defaultAssetsRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../../../assets");
}

export interface Ctx {
  /** Root of the assets package */
  root: string;
  config: AssetsConfig;
  /** Gitignored cache for downloads, extracted sources and conversion staging */
  cacheDir: string;
  /** Staging dir for converted (not yet optimized) svgs */
  stageDir: string;
}

export function createCtx(root: string): Ctx {
  const config = loadConfig(root);
  const cacheDir = path.join(root, ".cache");
  const stageDir = path.join(cacheDir, "stage");
  fs.mkdirSync(stageDir, { recursive: true });
  return { root, config, cacheDir, stageDir };
}

export function sourceDir(ctx: Ctx, org: string): string {
  return path.join(ctx.cacheDir, "source", org);
}

export function assetsDir(ctx: Ctx): string {
  return path.join(ctx.root, "src", "assets");
}

export function reactDir(ctx: Ctx): string {
  return path.join(ctx.root, "src", "react");
}

export function svgPath(ctx: Ctx, output: string): string {
  return path.join(assetsDir(ctx), `${output}.svg`);
}

export function reactPath(ctx: Ctx, output: string): string {
  return path.join(reactDir(ctx), `${output}.tsx`);
}
