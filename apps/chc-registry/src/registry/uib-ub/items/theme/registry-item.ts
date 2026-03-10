import type { Registry } from 'shadcn/schema';

export const themes: Registry['items'] = [
  {
    name: 'theme',
    type: 'registry:theme',
    title: 'Theme',
    description: 'Theme',
    cssVars: {
      theme: {
        "font-serif": "'EB Garamond', 'Times New Roman', Times, serif",
        "font-sans": "'Myriad Pro', 'Open Sans', sans-serif",

      }
    }
  },
];