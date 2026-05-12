import type { Registry } from 'shadcn/schema';

export const blocks: Registry['items'] = [
  {
    name: 'iiif-viewer',
    type: 'registry:block',
    title: 'IIIF Viewer',
    description: 'IIIF Viewer',
    files: [
      {
        path: 'uib-ub/items/iiif-viewer/components/iiif-viewer.tsx',
        type: 'registry:component',
        target: 'components/ui/chc/iiif-viewer.tsx',
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
    title: 'IIIF Viewer',
    description: 'IIIF Viewer',
    files: [
      {
        path: 'uib-ub/items/iiif-viewer/examples/iiif-viewer-demo.tsx',
        type: 'registry:example',
      },
    ],
    registryDependencies: ['https://chc-registry.vercel.app/r/iiif-viewer.json'],
  },
];
