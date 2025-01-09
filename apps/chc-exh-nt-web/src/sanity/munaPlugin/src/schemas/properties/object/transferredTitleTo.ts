
export const transferredTitleTo = {
  name: 'transferredTitleTo',
  title: 'Overførte tittel til',
  description: '',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Actor' }
      ]
    }
  ],
};
