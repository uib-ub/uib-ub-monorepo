import { defineType } from 'sanity'

export default defineType({
  name: 'MiradorGallery',
  type: 'object',
  title: 'Mirador galleri',
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    {
      name: 'items',
      title: 'Vinduer',
      type: 'array',
      of: [{ type: 'MiradorGalleryWindow' }],
    },
    {
      name: 'label',
      title: 'Tittel',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Beskrivelse',
      type: 'simpleBlockContent',
    },
  ],
  preview: {
    select: {
      title: 'label',
      media: 'items.0.manifestRef.image',
      items: 'items'
    },

    prepare({ title, media, items }) {
      const count = items?.length ?? 'no'
      return {
        title: title ?? 'Missing title',
        subtitle: `Mirador galleri, ${count} document(s)`,
        media: media ?? ''
      }
    }

  },
})
