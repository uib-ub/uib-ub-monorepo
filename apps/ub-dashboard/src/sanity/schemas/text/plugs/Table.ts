export const Table = {
  type: 'object',
  name: 'Table',
  title: 'Tabell',
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    {
      name: 'title',
      title: 'Tittel',
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
    prepare({ title, disabled }: any) {
      return {
        title: title,
        subtitle: `${disabled ? 'Avslått: ' : ''}Tabell`,
      }
    },
  },
}
