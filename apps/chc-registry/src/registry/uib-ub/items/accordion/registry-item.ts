import type { Registry } from 'shadcn/schema';

export const blocks: Registry['items'] = [
  {
    name: 'accordion',
    type: 'registry:ui',
    title: 'Accordion',
    description: 'Accordion',
    files: [
      {
        path: 'uib-ub/items/accordion/components/accordion.tsx',
        type: 'registry:ui',
      },
    ],
    dependencies: [
      '@base-ui/react',
    ],
  },
  {
    name: 'accordion-demo',
    type: 'registry:example',
    title: 'Accordion',
    description: 'Accordion',
    files: [
      {
        path: 'uib-ub/items/accordion/examples/accordion-demo.tsx',
        type: 'registry:example',
      },
    ],
  },
];
