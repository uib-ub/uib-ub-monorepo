export const assignedActor = {
  name: 'assignedActor',
  title: 'Aktør',
  type: 'reference',
  to: [
    { type: 'Actor' },
  ],
  options: {
    semanticSanity: {
      '@type': '@id'
    }
  },
};