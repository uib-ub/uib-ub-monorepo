import { defineType } from 'sanity'

export default defineType({
  name: 'TableBlock',
  type: 'object',
  title: 'Tabell',
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
      name: 'data',
      title: 'Tabell',
      type: 'table',
    },
  ],
  preview: {
    select: {
      title: 'label',
      disabled: 'disabled',
    },
    prepare({ title, disabled }) {
      return {
        title: title,
        subtitle: `${disabled ? 'Avslått: ' : ''}Tabell`,
      }
    },
  },
})
