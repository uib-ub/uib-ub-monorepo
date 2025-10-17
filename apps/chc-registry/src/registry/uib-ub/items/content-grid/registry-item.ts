import type { Registry } from 'shadcn/schema';

export const blocks: Registry['items'] = [
  {
    name: 'content-grid',
    type: 'registry:block',
    title: 'Content Grid',
    description: 'Content Grid',
    files: [
      {
        path: 'uib-ub/items/content-grid/components/content-grid.tsx',
        type: 'registry:component',
        target: '~/components/ui/chc/content-grid/content-grid.tsx',
      },
      {
        path: 'uib-ub/items/content-grid/components/styles/content-grid.css',
        type: 'registry:style',
        target: '~/components/ui/chc/content-grid/styles/content-grid.css',
      },
    ],
    dependencies: [
      '@radix-ui/react-slot',
      'next',
    ],
    css: {
      "@import \"../components/ui/chc/content-grid/styles/content-grid.css\"": {},
      "@layer components": {
        "--gap": "clamp(1rem, 6vw, 3rem)",
        "--full": "minmax(var(--gap), 1fr)",
        "--content": "min(55ch, 100% - var(--gap) * 2)",
        "--popout": "minmax(1rem, 1.5rem)",
        "--feature": "minmax(0, 10rem)",
        "display": "grid",
        "container-name": "content-grid",
        "container-type": "inline-size",
        "row-gap": "0",
        "width": "100%",
        "grid-template-columns": "full-start var(--full) feature-start var(--feature) popout-start var(--popout) content-start var(--content) content-end var(--popout) popout-end var(--feature) feature-end var(--full) full-end",
        "p": "grid-column: content",
        "h1": "grid-column: content",
        "h2": "grid-column: content",
        "h3": "grid-column: content",
        "h4": "grid-column: content",
        "h5": "grid-column: content",
        "h6": "grid-column: content",
      }
    }
  },
  {
    name: 'content-grid-demo',
    type: 'registry:example',
    title: 'Content Grid',
    description: 'Content Grid',
    files: [
      {
        path: 'uib-ub/items/content-grid/examples/content-grid-demo.tsx',
        type: 'registry:example',
      },
    ],
    registryDependencies: ['https://chc-registry.vercel.app/r/content-grid.json'],
  },
];
