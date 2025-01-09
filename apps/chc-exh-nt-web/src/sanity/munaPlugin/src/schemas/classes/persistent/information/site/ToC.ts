import { defineType } from 'sanity'
import { coalesceLabel } from '../../../../../helpers'

export default defineType({
  name: 'ToC',
  type: 'document',
  title: 'Table of Contents',
  fields: [
    {
      type: 'LocalizedString',
      name: 'label',
      title: 'Title',
    },
    {
      type: 'array',
      name: 'sections',
      title: 'Sections',
      of: [{ type: 'ToCSection' }]
    }
  ],
  preview: {
    select: {
      label: 'title',
    },
    prepare({ label }) {
      return {
        title: coalesceLabel(label),
        subtitle: "Innholdsfortegnelse"
      }
    },
  },
})