import { defineType } from 'sanity';

export default defineType({
  name: 'Gallery',
  type: 'object',
  title: 'Galleri',
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
      of: [{ type: 'ItemView' }],
    },
    {
      name: 'label',
      title: 'Tittel',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'label',
      media: 'items.0.image',
      items: 'items'
    },
    prepare: ({ title, media, items }) => ({
      title: title ?? 'Galleri uten tittel',
      subtitle: `Galleri, ${items?.length ?? '??'} dokument`,
      media: media ?? ''
    }),
  },
})
