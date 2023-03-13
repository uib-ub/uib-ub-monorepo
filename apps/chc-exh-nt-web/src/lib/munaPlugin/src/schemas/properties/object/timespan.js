export const timespan = {
  name: 'timespan',
  title: 'Tidsspenn',
  type: 'array',
  of: [{ type: 'Timespan' }],
  options: {
    modal: 'fullscreen',
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
  validation: (Rule) => Rule.length(1).warning('You should only register one timespan'),
};
