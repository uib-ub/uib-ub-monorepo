import type { Registry } from 'shadcn/schema';

export const blocks: Registry['items'] = [
  {
    name: 'hero-card',
    type: 'registry:ui',
    title: 'Hero Card',
    description: 'Hero Card',
    files: [
      {
        path: 'uib-ub/items/hero-card/components/hero-card.tsx',
        type: 'registry:ui',
      },
    ],
    dependencies: [
      '@base-ui/react',
    ],
  },
  {
    name: 'hero-card-demo',
    type: 'registry:example',
    title: 'Hero Card',
    description: 'Hero Card',
    files: [
      {
        path: 'uib-ub/items/hero-card/examples/hero-card.tsx',
        type: 'registry:example',
      },
    ],
  },
];
