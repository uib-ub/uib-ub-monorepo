import type { Registry } from 'shadcn/schema';

export const blocks: Registry['items'] = [
  {
    name: 'card',
    type: 'registry:ui',
    title: 'Card',
    description: 'Card',
    files: [
      {
        path: 'uib-ub/items/card/components/card.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'card-demo',
    type: 'registry:example',
    title: 'Card',
    description: 'Card',
    files: [
      {
        path: 'uib-ub/items/card/examples/card-demo.tsx',
        type: 'registry:example',
      },
    ],
  },
];
