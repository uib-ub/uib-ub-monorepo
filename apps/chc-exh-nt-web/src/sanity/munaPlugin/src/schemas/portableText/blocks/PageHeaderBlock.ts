import { defineType } from 'sanity'

export default defineType({
  name: 'PageHeaderBlock',
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
      name: 'label',
      title: 'Tittel',
      type: 'string',
    },
    {
      name: 'subtitle',
      title: 'Undertittel',
      fieldset: 'subtitle',
      type: 'simpleBlockContent',
    },
    {
      name: 'illustration',
      title: 'Illustrasjon',
      type: 'Illustration',
    },
  ],
  preview: {
    select: {
      title: 'label',
      media: 'illustration',
    },
    prepare({ title, media }) {
      return {
        title: title,
        subtitle: 'Sideoverskrift',
        media: media?.image,
      }
    },
  },
})
