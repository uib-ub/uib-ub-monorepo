export const PageHeader = {
  name: 'PageHeader',
  type: 'object',
  title: 'Sideoverskrift',
  fieldsets: [
    {
      name: 'subtitle',
      title: 'Undertittel',
      options: { collapsible: true, collapsed: true },
    },
  ],
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
      name: 'subtitle',
      title: 'Undertittel',
      fieldset: 'subtitle',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }: any) {
      return {
        title: title,
        subtitle: 'Sideoverskrift',
      }
    },
  },
}
