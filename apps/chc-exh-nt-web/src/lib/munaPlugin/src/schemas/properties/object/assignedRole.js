export const assignedRole = {
  name: 'assignedRole',
  title: 'Rolle',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'Role' }],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
};