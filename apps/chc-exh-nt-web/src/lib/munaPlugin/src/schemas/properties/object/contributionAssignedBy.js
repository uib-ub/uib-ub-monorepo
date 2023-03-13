export const contributionAssignedBy = {
  name: 'contributionAssignedBy',
  title: 'Utført av',
  type: 'array',
  of: [
    { type: 'ContributionAssignment' }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
};
