
export const carriedOutBy = {
  name: 'carriedOutBy',
  title: 'Utført av',
  type: 'array',
  of: [{
    type: 'reference',
    to: [
      { type: 'Actor' },
    ]
  }],
};
