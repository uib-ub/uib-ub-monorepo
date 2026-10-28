import chalk from "chalk";
import type { Command } from "commander";
import { createCtx, defaultAssetsRoot, type Ctx } from "./paths.js";
import { fetchOrg, type ChangeStatus } from "./fetch.js";
import { convertOrg } from "./convert.js";
import { optimizeOrg } from "./optimize.js";
import { buildComponents } from "./build.js";
import { findOrphans, pruneAssets } from "./prune.js";

function statusLabel(status: ChangeStatus): string {
  switch (status) {
    case "new":
      return chalk.green("+ new");
    case "updated":
      return chalk.yellow("~ updated");
    default:
      return chalk.dim("= unchanged");
  }
}

function printFetch(report: Awaited<ReturnType<typeof fetchOrg>>): void {
  console.log(chalk.bold(`\n${report.org}: fetch`));
  for (const change of report.changes) {
    console.log(
      `  ${statusLabel(change.status)}  ${change.file} -> ${change.output}`,
    );
  }
  for (const file of report.missing) {
    console.log(chalk.red(`  ! missing from zip: ${file}`));
  }
  if (report.unmapped.length > 0) {
    console.log(
      chalk.dim(
        `  (unmapped files in zip, not extracted: ${report.unmapped.join(", ")})`,
      ),
    );
  }
}

function printConvert(report: Awaited<ReturnType<typeof convertOrg>>): void {
  console.log(chalk.bold(`\n${report.org}: convert`));
  for (const item of report.converted) {
    console.log(
      `  ${chalk.green("✓")} ${item.from} -> ${item.output}.svg (${item.tool})`,
    );
  }
  for (const item of report.skipped) {
    console.log(chalk.dim(`  - skipped ${item.output}: ${item.reason}`));
  }
}

function printOptimize(report: Awaited<ReturnType<typeof optimizeOrg>>): void {
  console.log(chalk.bold(`\n${report.org}: optimize`));
  for (const change of report.changes) {
    console.log(
      `  ${statusLabel(change.status)}  src/assets/${change.output}.svg`,
    );
  }
  for (const item of report.skipped) {
    console.log(chalk.dim(`  - skipped ${item.output}: ${item.reason}`));
  }
}

function printBuild(report: Awaited<ReturnType<typeof buildComponents>>): void {
  console.log(chalk.bold("\nbuild"));
  for (const component of report.components) {
    console.log(
      `  ${statusLabel(component.status)}  src/react/${component.output}.tsx`,
    );
  }
  for (const output of report.reactOnly) {
    console.log(
      chalk.dim(`  - ${output}: no svg source, kept existing component`),
    );
  }
  for (const output of report.missing) {
    console.log(
      chalk.red(
        `  ! missing: ${output} is in config but has no svg (run fetch/convert/optimize)`,
      ),
    );
  }
  for (const output of report.unmanaged) {
    console.log(
      chalk.yellow(
        `  ! unmanaged svg: src/assets/${output}.svg (not in config)`,
      ),
    );
  }
  for (const output of report.unknownComponents) {
    console.log(
      chalk.yellow(
        `  ! unknown component: src/react/${output}.tsx (not in config)`,
      ),
    );
  }
  console.log(`  ${statusLabel(report.indexStatus)}  src/react/index.ts`);
}

function resolveCtx(root?: string): Ctx {
  return createCtx(root ?? defaultAssetsRoot());
}

function orgKeys(ctx: Ctx, org?: string): string[] {
  if (org) {
    if (!ctx.config.orgs[org]) {
      throw new Error(
        `Unknown org "${org}". Configured orgs: ${Object.keys(ctx.config.orgs).join(", ")}`,
      );
    }
    return [org];
  }
  return Object.keys(ctx.config.orgs);
}

export function registerAssetsCommand(program: Command): void {
  const assets = program
    .command("assets")
    .description("Manage svg/react assets in the assets package")
    .option(
      "-r, --root <path>",
      "Path to the assets package",
      defaultAssetsRoot(),
    );

  assets
    .command("list")
    .description("Show configured orgs, assets and their local state")
    .action(async (options) => {
      const ctx = resolveCtx(options.root);
      for (const [orgKey, org] of Object.entries(ctx.config.orgs)) {
        console.log(
          chalk.bold(`\n${orgKey}`),
          chalk.dim(`(${org.label}) — source: ${org.source.type}`),
        );
        for (const asset of org.assets) {
          const flags: string[] = [];
          if (asset.exportName) flags.push(`export: ${asset.exportName}`);
          if (asset.build === false) flags.push("no build");
          if (asset.currentColor) flags.push("currentColor");
          if (asset.deprecated) flags.push(chalk.yellow("deprecated"));
          const label = asset.deprecated
            ? chalk.strikethrough(asset.output)
            : asset.output;
          console.log(
            `  ${label}${flags.length > 0 ? chalk.dim(` [${flags.join(", ")}]`) : ""}`,
          );
        }
      }
    });

  assets
    .command("fetch")
    .description("Download sources and extract mapped files into .cache/source")
    .argument("[org]", "Org to fetch (default: all)")
    .action(async (org, options) => {
      const ctx = resolveCtx(options.root);
      for (const orgKey of orgKeys(ctx, org)) {
        printFetch(await fetchOrg(ctx, orgKey));
      }
    });

  assets
    .command("convert")
    .description(
      "Convert source files (pdf/eps/ai via inkscape, ps via ghostscript, svg passthrough) to staged svgs",
    )
    .argument("[org]", "Org to convert (default: all)")
    .action(async (org, options) => {
      const ctx = resolveCtx(options.root);
      for (const orgKey of orgKeys(ctx, org)) {
        printConvert(await convertOrg(ctx, orgKey));
      }
    });

  assets
    .command("optimize")
    .description("Run svgo over staged svgs into src/assets")
    .argument("[org]", "Org to optimize (default: all)")
    .action(async (org, options) => {
      const ctx = resolveCtx(options.root);
      for (const orgKey of orgKeys(ctx, org)) {
        printOptimize(await optimizeOrg(ctx, orgKey));
      }
    });

  assets
    .command("build")
    .description("Generate react components and index.ts from src/assets svgs")
    .action(async (options) => {
      const ctx = resolveCtx(options.root);
      printBuild(await buildComponents(ctx));
    });

  assets
    .command("prune")
    .description(
      "Report svgs/components that are not in the config (dry-run by default)",
    )
    .option(
      "--delete",
      "Actually delete the orphaned files and refresh src/react/index.ts",
    )
    .action(async (options) => {
      const ctx = resolveCtx(options.root);
      if (options.delete) {
        const report = pruneAssets(ctx);
        for (const rel of report.svgs) {
          console.log(chalk.red(`  - deleted ${rel}`));
        }
        for (const rel of report.components) {
          console.log(chalk.red(`  - deleted ${rel}`));
        }
        if (report.svgs.length + report.components.length > 0) {
          // Refresh index.ts so it no longer exports the deleted
          // components.
          const build = await buildComponents(ctx);
          console.log(`  ${statusLabel(build.indexStatus)}  src/react/index.ts`);
        }
        console.log(
          chalk.green(
            `\nPruned ${report.svgs.length + report.components.length} file(s).`,
          ),
        );
        return;
      }
      const { svgs, components } = findOrphans(ctx);
      console.log(
        chalk.dim(
          "prune (dry-run — nothing deleted, pass --delete to remove)\n",
        ),
      );
      for (const rel of svgs) {
        console.log(chalk.yellow(`  ! orphaned svg: ${rel}`));
      }
      for (const rel of components) {
        console.log(chalk.yellow(`  ! orphaned component: ${rel}`));
      }
      if (svgs.length + components.length === 0) {
        console.log(chalk.green("  No orphans — everything is managed."));
      } else {
        console.log(
          `\n${svgs.length + components.length} file(s) would be deleted.`,
        );
      }
    });

  assets
    .command("update")
    .description("fetch -> convert -> optimize -> build")
    .argument("[org]", "Org to update (default: all)")
    .action(async (org, options) => {
      const ctx = resolveCtx(options.root);
      for (const orgKey of orgKeys(ctx, org)) {
        printFetch(await fetchOrg(ctx, orgKey));
        printConvert(await convertOrg(ctx, orgKey));
        printOptimize(await optimizeOrg(ctx, orgKey));
      }
      printBuild(await buildComponents(ctx));
      console.log(chalk.green("\nDone."));
    });
}
