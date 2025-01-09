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
};