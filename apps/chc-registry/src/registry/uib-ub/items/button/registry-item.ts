import type { Registry } from 'shadcn/schema';

export const blocks: Registry['items'] = [
  {
    name: 'button',
    type: 'registry:ui',
    title: 'Button',
    description: 'Button',
    files: [
      {
        path: 'uib-ub/items/button/components/button.tsx',
        type: 'registry:ui',
      },
    ],
    dependencies: [
      '@base-ui/react',
    ],
  },
  {
    name: 'button-demo',
    type: 'registry:example',
    title: 'Button',
    description: 'Button',
    files: [
      {
        path: 'uib-ub/items/button/examples/button-demo.tsx',
        type: 'registry:example',
      },
    ],
    registryDependencies: ['https://chc-registry.vercel.app/r/button.json'],
  },
];
