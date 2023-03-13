export const about = {
  name: 'about',
  title: 'About',
  type: 'reference',
  to: [
    { type: 'HumanMadeObject' },
    { type: 'Actor' },
  ],
  options: {
    semanticSanity: {
      '@type': '@id',
      '@container': '@set',
    }
  },
};