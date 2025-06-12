import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  platform: 'node',
  target: 'node16',
  splitting: false,
  sourcemap: true,
  noExternal: ['jsonld'], // Bundle jsonld to handle its dependencies
  banner: {
    js: `
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    `,
  },
  esbuildOptions(options) {
    options.conditions = ['import', 'node'];
    // Handle node built-in modules
    options.external = [
      'crypto', 
      'fs', 
      'path', 
      'url', 
      'util', 
      'stream', 
      'buffer', 
      'events',
      'http',
      'https',
      'zlib'
    ];
  },
});
