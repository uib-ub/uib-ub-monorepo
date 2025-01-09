import { defineType } from 'sanity'

export default defineType({
  name: 'GeojsonFeature',
  type: 'object',
  title: 'Feature',
  fields: [
    {
      name: 'geometry',
      title: 'Geometri',
      type: 'GeojsonPoint',
    },
    {
      name: 'properties',
      title: 'Egenskaper',
      type: 'GeojsonProperties',
    },
  ],
  preview: {
    select: {
      type: 'properties.type',
    },
    prepare(selection) {
      const { type } = selection
      return {
        title: type || 'Point',
      }
    },
  },
})
