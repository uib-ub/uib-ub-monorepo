/**
 * hasMember
 * la:has_member
 */

export const hasMember = {
  name: 'hasMember',
  title: 'Har deler',
  type: 'array',
  of: [{
    type: 'reference',
    to: [
      { type: 'HumanMadeObject' },
      { type: 'Actor' },
    ]
  }],
};
