import { describe, expect, it } from 'vitest';
import { pascalCase, isKebabCase } from './naming.js';
import { validateConfig, type AssetsConfig } from './config.js';
import { isJunkEntry } from './fs-utils.js';

describe('pascalCase', () => {
  it('converts kebab-case to PascalCase', () => {
    expect(pascalCase('uib-ub-no')).toBe('UibUbNo');
    expect(pascalCase('cmi-en')).toBe('CmiEn');
    expect(pascalCase('iiif')).toBe('Iiif');
  });
});

describe('isKebabCase', () => {
  it('accepts kebab-case names', () => {
    expect(isKebabCase('uib-ub-no')).toBe(true);
    expect(isKebabCase('iiif')).toBe(true);
  });

  it('rejects other names', () => {
    expect(isKebabCase('UiB')).toBe(false);
    expect(isKebabCase('uib_ub')).toBe(false);
    expect(isKebabCase('')).toBe(false);
  });
});

describe('validateConfig', () => {
  it('accepts a valid config', () => {
    const config: AssetsConfig = {
      orgs: {
        uib: {
          label: 'Test',
          source: { type: 'zip', url: 'https://example.com/logo.zip' },
          assets: [{ file: 'PDF/logo.pdf', output: 'test-logo' }],
        },
      },
    };
    expect(validateConfig(config)).toEqual([]);
  });

  it('requires file for zip sources unless the asset is local', () => {
    const base = {
      label: 'Test',
      source: { type: 'zip', url: 'https://example.com/logo.zip' },
    } as const;
    // A fetched asset in a zip org must map a zip member
    const fetched: AssetsConfig = {
      orgs: {
        uib: {
          ...base,
          assets: [{ output: 'test-logo', url: 'https://example.com/x.svg' }],
        },
      },
    };
    expect(validateConfig(fetched).length).toBe(1);
    // An asset with neither file nor url is local: hand-managed svg
    const local: AssetsConfig = {
      orgs: {
        uib: {
          ...base,
          assets: [{ output: 'test-icon' }],
        },
      },
    };
    expect(validateConfig(local)).toEqual([]);
  });

  it('rejects duplicate output names', () => {
    const config: AssetsConfig = {
      orgs: {
        a: {
          label: 'A',
          source: { type: 'local' },
          assets: [{ output: 'same-name' }],
        },
        b: {
          label: 'B',
          source: { type: 'local' },
          assets: [{ output: 'same-name' }],
        },
      },
    };
    expect(validateConfig(config).length).toBe(1);
  });
});

describe('isJunkEntry', () => {
  it('filters macos and metadata entries', () => {
    expect(isJunkEntry('__MACOSX/PDF/._logo.pdf')).toBe(true);
    expect(isJunkEntry('PDF/.DS_Store')).toBe(true);
    expect(isJunkEntry('PDF/')).toBe(true);
    expect(isJunkEntry('PDF/logo.pdf')).toBe(false);
  });
});
