import fs from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';
import type { Ctx } from './paths.js';
import { sourceDir } from './paths.js';
import { isJunkEntry, fileHash, sha256 } from './fs-utils.js';
import { isLocalAsset } from './config.js';

export type ChangeStatus = 'new' | 'updated' | 'unchanged';

export interface FetchReport {
  org: string;
  changes: { output: string; file: string; status: ChangeStatus }[];
  /** Mapped files that were not found in the zip */
  missing: string[];
  /** Non-junk zip entries that are not mapped in the config */
  unmapped: string[];
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${url}: ${response.status} ${response.statusText}`,
    );
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function fetchOrg(ctx: Ctx, orgKey: string): Promise<FetchReport> {
  const org = ctx.config.orgs[orgKey];
  if (!org) throw new Error(`Unknown org: ${orgKey}`);

  const report: FetchReport = {
    org: orgKey,
    changes: [],
    missing: [],
    unmapped: [],
  };
  const destDir = sourceDir(ctx, orgKey);
  fs.mkdirSync(destDir, { recursive: true });

  if (org.source.type === 'local') {
    return report;
  }

  if (org.source.type === 'files') {
    for (const asset of org.assets) {
      // Local assets have no upstream source: their svg lives in
      // src/assets and is managed by hand.
      if (isLocalAsset(org, asset)) continue;
      const buffer = await download(asset.url!);
      const isZip = asset.url!.split('?')[0].endsWith('.zip');

      if (isZip) {
        // Per-asset zip: extract the mapped file from it
        const zip = new AdmZip(buffer);
        const entry = zip
          .getEntries()
          .find(
            (candidate) =>
              !isJunkEntry(candidate.entryName) &&
              candidate.entryName.replace(/\\/g, '/') === asset.file,
          );
        if (!entry) {
          report.missing.push(`${asset.url!}#${asset.file}`);
          continue;
        }
        const data = entry.getData();
        const basename = path.basename(asset.file!);
        const dest = path.join(destDir, basename);
        const status: ChangeStatus =
          fileHash(dest) === sha256(data)
            ? 'unchanged'
            : fs.existsSync(dest)
              ? 'updated'
              : 'new';
        if (status !== 'unchanged') fs.writeFileSync(dest, data);
        report.changes.push({ output: asset.output, file: basename, status });
        continue;
      }

      // `file` overrides the cache basename when the url does not end in a
      // usable filename (e.g. Google Drive direct-download links).
      const basename = asset.file ?? path.basename(new URL(asset.url!).pathname);
      const dest = path.join(destDir, basename);
      const status: ChangeStatus =
        fileHash(dest) === sha256(buffer)
          ? 'unchanged'
          : fs.existsSync(dest)
            ? 'updated'
            : 'new';
      if (status !== 'unchanged') fs.writeFileSync(dest, buffer);
      report.changes.push({ output: asset.output, file: basename, status });
    }
    return report;
  }

  // zip source
  const spinner = (await import('ora'))
    .default(`Downloading ${org.source.url}`)
    .start();
  let zipBuffer: Buffer;
  try {
    zipBuffer = await download(org.source.url);
    const zipCache = path.join(ctx.cacheDir, 'zips', `${orgKey}.zip`);
    fs.mkdirSync(path.dirname(zipCache), { recursive: true });
    fs.writeFileSync(zipCache, zipBuffer);
    spinner.succeed(
      `Downloaded ${org.source.url} (${(zipBuffer.length / 1024 / 1024).toFixed(1)} MB)`,
    );
  } catch (error) {
    spinner.fail(`Download failed for ${org.source.url}`);
    throw error;
  }

  const zip = new AdmZip(zipBuffer);
  const entries = zip
    .getEntries()
    .filter((entry) => !isJunkEntry(entry.entryName));
  const entryByName = new Map(
    entries.map((entry) => [entry.entryName.replace(/\\/g, '/'), entry]),
  );

  const mappedFiles = new Set(
    org.assets.filter((asset) => !isLocalAsset(org, asset)).map((asset) => asset.file!),
  );
  for (const entry of entries) {
    const name = entry.entryName.replace(/\\/g, '/');
    if (!mappedFiles.has(name)) {
      report.unmapped.push(name);
    }
  }

  for (const asset of org.assets) {
    if (isLocalAsset(org, asset)) continue;
    const entry = entryByName.get(asset.file!);
    if (!entry) {
      report.missing.push(asset.file!);
      continue;
    }
    const data = entry.getData();
    const basename = path.basename(asset.file!);
    const dest = path.join(destDir, basename);
    const status: ChangeStatus =
      fileHash(dest) === sha256(data)
        ? 'unchanged'
        : fs.existsSync(dest)
          ? 'updated'
          : 'new';
    if (status !== 'unchanged') fs.writeFileSync(dest, data);
    report.changes.push({ output: asset.output, file: basename, status });
  }

  return report;
}
