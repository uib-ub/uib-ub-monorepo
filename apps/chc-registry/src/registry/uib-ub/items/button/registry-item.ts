import type { Registry } from 'shadcn/schema';

export const blocks: Registry['items'] = [
  {
    name: 'button',
    type: 'registry:block',
    title: 'Button',
    description: 'Button',
    files: [
      {
        path: 'uib-ub/items/button/components/button.tsx',
        type: 'registry:component',
      },
    ],
    dependencies: [
      '@radix-ui/react-slot',
      'next',
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
