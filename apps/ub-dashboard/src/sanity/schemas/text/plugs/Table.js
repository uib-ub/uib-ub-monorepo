export const Table = {
  type: 'object',
  name: 'Table',
  title: 'Tabell',
  options: {
    semanticSanity: {
      exclude: true
    }
  },
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      titleEN: 'Disabled',
      type: 'boolean',
    },
    {
      name: 'title',
      title: 'Tittel',
      titleEN: 'Title',
      type: 'string',
    },
    {
      name: 'data',
      title: 'Tabell',
      type: 'table',
    },
  ],
  preview: {
    select: {
      title: 'title',
      disabled: 'disabled',
    },
    prepare({ title, disabled }) {
      return {
        title: title,
        subtitle: `${disabled ? 'Avslått: ' : ''}Tabell`,
      }
    },
  },
}
