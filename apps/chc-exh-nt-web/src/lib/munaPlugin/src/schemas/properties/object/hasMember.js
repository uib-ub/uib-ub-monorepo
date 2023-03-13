/**
 * hasMember
 * la:has_member
 */

export const hasMember = {
  name: 'hasMember',
  title: 'Har deler',
  titleEN: 'Has member',
  type: 'array',
  of: [{
    type: 'reference',
    to: [
      { type: 'HumanMadeObject' },
      { type: 'Actor' },
    ]
  }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
};
