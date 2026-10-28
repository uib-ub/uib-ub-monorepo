import crypto from 'node:crypto';
import fs from 'node:fs';

export function sha256(data: Buffer | string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function fileHash(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  return sha256(fs.readFileSync(filePath));
}

/**
 * Zip entries that should never be extracted or reported:
 * directories, macOS resource forks (__MACOSX/, ._*), .DS_Store, etc.
 */
export function isJunkEntry(entryName: string): boolean {
  const normalized = entryName.replace(/\\/g, '/');
  if (normalized.endsWith('/')) return true;
  if (normalized.startsWith('__MACOSX/')) return true;
  const base = normalized.split('/').pop() ?? '';
  if (base.startsWith('._')) return true;
  if (base === '.DS_Store') return true;
  return false;
}
