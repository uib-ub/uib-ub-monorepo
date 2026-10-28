import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { optimize } from "svgo";
import type { Ctx } from "./paths.js";
import { assetsDir, svgPath } from "./paths.js";
import { createStripJunkPlugin } from "./convert.js";
import { isLocalAsset } from "./config.js";
import { toCurrentColor } from "./current-color.js";
import { autocropGeometricPlugin } from "./autocrop.js";
import { fileHash, sha256 } from "./fs-utils.js";
import type { ChangeStatus } from "./fetch.js";

export interface OptimizeReport {
  org: string;
  changes: { output: string; status: ChangeStatus }[];
  skipped: { output: string; reason: string }[];
}

/**
 * Load the svgo config from the assets package. It is a CJS module, so
 * load it relative to its own location.
 */
export function loadSvgoConfig(root: string): Record<string, unknown> {
  const configPath = path.join(root, "svgo.config.js");
  const require = createRequire(configPath);
  return require(configPath) as Record<string, unknown>;
}

/**
 * The svgo config marks where the geometric autocrop plugin runs with a
 * `{ name: "autocrop-geometric" }` placeholder (the implementation lives
 * here in the cli package). Swap the placeholder for the real plugin,
 * keeping the plugin order declared in the config.
 */
function withAutocropPlugin(config: Record<string, unknown>): Record<string, unknown> {
  const plugins = (config.plugins as unknown[]).map((plugin) =>
    plugin !== null &&
    typeof plugin === "object" &&
    (plugin as { name?: unknown }).name === "autocrop-geometric"
      ? autocropGeometricPlugin
      : plugin,
  );
  return { ...config, plugins };
}

/**
 * Conservative cleanup for hand-managed local svgs: strips editor junk
 * (inkscape/sodipodi/Adobe namespaces, metadata, comments) so generated
 * react components typecheck — without touching geometry, colors or
 * embedded dark-mode <style> blocks.
 */
function cleanLocalSvg(svg: string): string {
  // Drop the deprecated SVG 1.0 `enable-background` style hint (Adobe
  // export junk): react's svg typings reject the converted prop.
  svg = svg
    .replace(/enable-background:[^;"]*;?/g, "")
    .replace(/style="\s*"/g, "");
  // Only drop the xlink namespace declaration when nothing references it
  const usesXlink = /xlink:[a-zA-Z]+/.test(svg);
  const result = optimize(svg, {
    plugins: [
      createStripJunkPlugin({ removeIds: false, removeXlinkNs: !usesXlink }),
      "removeComments",
      "removeMetadata",
      "cleanupIds",
    ],
  });
  return result.data;
}

export async function optimizeOrg(
  ctx: Ctx,
  orgKey: string,
): Promise<OptimizeReport> {
  const org = ctx.config.orgs[orgKey];
  if (!org) throw new Error(`Unknown org: ${orgKey}`);

  const report: OptimizeReport = { org: orgKey, changes: [], skipped: [] };
  const svgoConfig = withAutocropPlugin(loadSvgoConfig(ctx.root));
  fs.mkdirSync(assetsDir(ctx), { recursive: true });

  for (const asset of org.assets) {
    // Local assets are the source of truth and managed by hand, but
    // they still need editor junk removed so `build` output typechecks.
    if (isLocalAsset(org, asset)) {
      const dest = svgPath(ctx, asset.output);
      if (!fs.existsSync(dest)) {
        report.skipped.push({
          output: asset.output,
          reason: "no local svg in src/assets",
        });
        continue;
      }
      const raw = fs.readFileSync(dest, "utf8");
      const data = Buffer.from(cleanLocalSvg(raw));
      const status: ChangeStatus =
        fileHash(dest) === sha256(data)
          ? "unchanged"
          : fs.existsSync(dest)
            ? "updated"
            : "new";
      if (status !== "unchanged") fs.writeFileSync(dest, data);
      report.changes.push({ output: asset.output, status });
      continue;
    }

    const stagePath = path.join(ctx.stageDir, `${asset.output}.svg`);
    if (!fs.existsSync(stagePath)) {
      report.skipped.push({
        output: asset.output,
        reason: "no staged svg (run convert first)",
      });
      continue;
    }

    const raw = fs.readFileSync(stagePath, "utf8");
    const result = optimize(raw, svgoConfig);
    if ("error" in result && result.error) {
      report.skipped.push({
        output: asset.output,
        reason: `svgo error: ${result.error}`,
      });
      continue;
    }

    // The geometric autocrop only rewrites the viewBox (coordinates are
    // never translated), so no separate rounding pass is needed.
    let data = result.data;
    if (asset.currentColor) {
      const colored = toCurrentColor(data);
      if ("error" in colored) {
        report.skipped.push({
          output: asset.output,
          reason: `currentColor: ${colored.error}`,
        });
        continue;
      }
      data = colored.data;
    }

    const dataBuf = Buffer.from(data);
    const dest = svgPath(ctx, asset.output);
    const status: ChangeStatus =
      fileHash(dest) === sha256(dataBuf)
        ? "unchanged"
        : fs.existsSync(dest)
          ? "updated"
          : "new";
    if (status !== "unchanged") fs.writeFileSync(dest, dataBuf);
    report.changes.push({ output: asset.output, status });
  }

  return report;
}
