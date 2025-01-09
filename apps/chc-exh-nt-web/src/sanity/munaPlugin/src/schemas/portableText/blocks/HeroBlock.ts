import { defineType } from 'sanity'

export default defineType({
  name: 'HeroBlock',
  type: 'object',
  title: 'Hero',
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
      name: 'tagline',
      title: 'Tagline',
      description: 'Tagline under tittelen. Bør ikke være lengre en to korte avsnitt.',
      type: 'blockContent',
    },
    {
      name: 'items',
      title: 'Objekt',
      type: 'ObjectBlockItem',
    },
  ],
  preview: {
    select: {
      title: 'label',
      media: 'illustration',
      object: 'item.image',
      disabled: 'disabled',
    },
    prepare({ title, media, object, disabled }) {
      return {
        title: `${title}`,
        subtitle: `Hero. ${disabled ? 'Avslått' : ''}`,
        media: media?.image ?? object,
      }
    },
  },
})
