import { type Registry } from 'shadcn/schema';
import glob from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import all registry items using glob pattern
const registryItemPaths = glob.sync('./**/items/**/registry-item.ts', {
  cwd: __dirname,
});

async function loadRegistryItems(): Promise<Registry['items'][]> {
  return Promise.all(
    registryItemPaths.map(async (file) => {
      const importPath = path.resolve(__dirname, file);
      const importedModule = await import(importPath);
      const items = (importedModule.default ?? importedModule.blocks) as Registry['items'];
      return items;
    }),
  );
}

export async function getRegistry(): Promise<Registry> {
  const itemsArrays = await loadRegistryItems();
  const registryItems: Registry['items'] = itemsArrays.flat();
  return {
    name: 'chc-registry',
    homepage: 'https://chc-registry.vercel.app',
    items: [...registryItems],
  } satisfies Registry;
}
