import type { Registry } from 'shadcn/registry';

export const blocks: Registry['items'] = [
  {
    name: 'iiif-image',
    type: 'registry:block',
    title: 'IIIF Image',
    description: 'IIIF Image',
    files: [
      {
        path: 'default/blocks/iiif-image/components/index.tsx',
        type: 'registry:component',
        target: '/components/iiif-image.tsx',
      },
    ],
    dependencies: [
      '@samvera/clover-iiif',
      'next',
    ],
  },
  {
    name: 'iiif-manifest',
    type: 'registry:block',
    title: 'IIIF Manifest',
    description: 'IIIF Manifest',
    files: [
      {
        path: 'default/blocks/iiif-manifest/components/index.tsx',
        type: 'registry:component',
        target: '/components/iiif-manifest.tsx',
      },
    ],
    dependencies: [
      '@samvera/clover-iiif',
      'next',
    ],
  },
];
