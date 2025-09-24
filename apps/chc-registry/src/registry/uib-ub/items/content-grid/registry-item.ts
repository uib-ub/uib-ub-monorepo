import type { Registry } from 'shadcn/schema';

export const blocks: Registry['items'] = [
  {
    name: 'content-grid',
    type: 'registry:block',
    title: 'Content Grid',
    description: 'Content Grid',
    files: [
      {
        path: 'uib-ub/items/content-grid/components/content-grid.tsx',
        type: 'registry:component',
        target: '~/components/ui/chc/content-grid/content-grid.tsx',
      },
      {
        path: 'uib-ub/items/content-grid/components/styles/content-grid.css',
        type: 'registry:style',
        target: '~/components/ui/chc/content-grid/styles/content-grid.css',
      },
    ],
    dependencies: [
      '@radix-ui/react-slot',
      'next',
    ],
    css: {
      "@import \"../components/ui/chc/content-grid/styles/content-grid.css\"": {},
    }
  },
  {
    name: 'content-grid-demo',
    type: 'registry:example',
    title: 'Content Grid',
    description: 'Content Grid',
    files: [
      {
        path: 'uib-ub/items/content-grid/examples/content-grid-demo.tsx',
        type: 'registry:example',
      },
    ],
    registryDependencies: ['https://chc-registry.vercel.app/r/content-grid.json'],
  },
];
