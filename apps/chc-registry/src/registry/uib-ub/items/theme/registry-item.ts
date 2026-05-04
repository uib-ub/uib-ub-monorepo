import type { Registry } from 'shadcn/schema';

export const themes: Registry['items'] = [
  {
    name: 'theme',
    type: 'registry:component',
    title: 'Theme',
    description: 'Theme',
    files: [
      {
        path: 'uib-ub/items/theme/components/styles/uib-theme.css',
        type: 'registry:style',
      },
      {
        path: 'uib-ub/items/theme/components/styles/ub-prose.css',
        type: 'registry:style',
      },
      {
        path: 'uib-ub/items/theme/components/styles/palette-red.css',
        type: 'registry:style',
      },
    ],
    css: {
      "@import \"tailwindcss\"": {},
      "@import \"./styles/uib-theme.css\"": {},
      "@import \"./styles/ub-prose.css\"": {},
      "@import \"./styles/palette-red.css\"": {},
    },
  },
];