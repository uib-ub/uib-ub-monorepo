import type { Registry } from 'shadcn/schema';

export const blocks: Registry['items'] = [
  {
    name: 'iiif-manifest',
    type: 'registry:block',
    title: 'IIIF Manifest',
    description: 'IIIF Manifest',
    files: [
      {
        path: 'uib-ub/items/iiif-manifest/components/iiif-manifest.tsx',
        type: 'registry:component',
        target: 'components/ui/chc/iiif-manifest.tsx',
      },
    ],
    registryDependencies: [
      'skeleton',
    ],
    dependencies: [
      '@samvera/clover-iiif',
      'next',
    ],
  },
  {
    name: 'iiif-manifest-demo',
    type: 'registry:example',
    title: 'IIIF Manifest',
    description: 'IIIF Manifest',
    files: [
      {
        path: 'uib-ub/items/iiif-manifest/examples/iiif-manifest-demo.tsx',
        type: 'registry:example',
      },
    ],
    registryDependencies: ['https://chc-registry.vercel.app/r/iiif-manifest.json'],
  },
];
