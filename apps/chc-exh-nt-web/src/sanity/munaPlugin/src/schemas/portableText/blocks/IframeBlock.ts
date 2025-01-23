import { defineType } from 'sanity'

export default defineType({
  name: 'IframeBlock',
  type: 'object',
  title: 'iFrame',
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
      name: 'url',
      title: 'url',
      description: 'Bruk selve nettadressen fra en iFrame. NB! Bruk med måte.',
      type: 'url',
    },
  ],

  preview: {
    select: {
      title: 'label',
      url: 'url',
    },
    prepare({ title, url }) {
      return {
        title: title ?? url,
        subtitle: 'iFrame',
      }
    },
  },
})
