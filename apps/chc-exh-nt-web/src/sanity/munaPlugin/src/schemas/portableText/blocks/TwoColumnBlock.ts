import { defineType } from 'sanity'

export default defineType({
  name: 'TwoColumnBlock',
  type: 'object',
  title: 'To kolonner',
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    {
      name: 'label',
      title: 'Tittel',
      type: 'string',
    },
    {
      name: 'subtitle',
      title: 'Undertittel',
      type: 'string',
    },
    {
      name: 'firstColumn',
      title: 'Første kolonne',
      type: 'blockContent',
    },
    {
      name: 'secondColumn',
      title: 'Andre kolonne',
      type: 'blockContent',
    },
    {
      name: 'anchor',
      title: 'Anker',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'label',
      content: 'firstColumn',
    },
    prepare({ title, content }) {
      const text = content
        ? content[0].children
          .filter((child: any) => child._type === 'span')
          .map((span: any) => span.text)
          .join('')
        : ''

      return {
        title: title || text || '',
        subtitle: 'To kolonner',
      }
    },
  },
})
