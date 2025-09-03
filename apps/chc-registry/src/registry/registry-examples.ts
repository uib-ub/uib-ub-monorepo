import type { Registry } from 'shadcn/schema';

export const examples: Registry['items'] = [
  {
    name: 'iiif-image-demo',
    type: 'registry:example',
    title: 'IIIF Image',
    description: 'IIIF Image',
    files: [
      {
        path: 'default/examples/iiif-image-demo.tsx',
        type: 'registry:example',
      },
    ],
    registryDependencies: ['https://chc-registry.vercel.app/r/iiif-image.json'],
  },
  {
    name: 'iiif-manifest-demo',
    type: 'registry:example',
    title: 'IIIF Manifest',
    description: 'IIIF Manifest',
    files: [
      {
        path: 'default/examples/iiif-manifest-demo.tsx',
        type: 'registry:example',
      },
    ],
    registryDependencies: ['https://chc-registry.vercel.app/r/iiif-manifest.json'],
  },
];
