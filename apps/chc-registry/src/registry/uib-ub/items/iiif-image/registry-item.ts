import type { Registry } from 'shadcn/schema';

export const blocks: Registry['items'] = [
  {
    name: 'iiif-image',
    type: 'registry:block',
    title: 'IIIF Image',
    description: 'IIIF Image',
    files: [
      {
        path: 'uib-ub/items/iiif-image/components/iiif-image.tsx',
        type: 'registry:component',
        target: 'components/ui/chc/iiif-image.tsx',
      },
    ],
    dependencies: [
      '@samvera/clover-iiif',
      'next',
    ],
  },
  {
    name: 'iiif-image-demo',
    type: 'registry:example',
    title: 'IIIF Image',
    description: 'IIIF Image',
    files: [
      {
        path: 'uib-ub/items/iiif-image/examples/iiif-image-demo.tsx',
        type: 'registry:example',
      },
    ],
    registryDependencies: ['https://chc-registry.vercel.app/r/iiif-image.json'],
  },
];
