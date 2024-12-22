import { defineType } from 'sanity'

export default defineType({
  name: 'GeojsonPoint',
  type: 'object',
  title: 'Point',
  fields: [
    {
      name: 'coordinates',
      title: 'Koordinater',
      type: 'geopoint',
    },
  ],
  preview: {
    select: {
      type: 'type',
    },
    prepare(selection) {
      const { type } = selection
      return {
        title: type,
      }
    },
  },
})
