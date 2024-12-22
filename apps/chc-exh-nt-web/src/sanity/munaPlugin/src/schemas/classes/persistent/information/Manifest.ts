import { defineType } from 'sanity'

export default defineType({
  name: 'Manifest',
  type: 'object',
  title: 'IIIF Manifest',
  fields: [
    {
      name: 'url',
      title: 'Manifest URL',
      type: 'url',
    },
  ],
  preview: {
    select: {
      url: 'url',
    },
    prepare(selection) {
      const { url } = selection
      return {
        title: `${url}`,
      }
    },
  },
})
