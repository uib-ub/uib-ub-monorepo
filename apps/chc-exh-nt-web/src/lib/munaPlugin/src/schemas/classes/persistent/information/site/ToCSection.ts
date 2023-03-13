import { defineType } from 'sanity'
import { coalesceLabel } from '../../../../../helpers'

export default defineType({
  name: 'ToCSection',
  type: 'object',
  title: 'Section',
  fields: [
    {
      type: 'reference',
      name: 'target',
      title: 'Target',
      to: [
        { type: 'Route' },
        // etc
      ]
    },
    {
      type: 'LocalizedString',
      name: 'label',
      title: 'Title'
      // to override title from referenced items
    },
    {
      type: 'array',
      name: 'links',
      title: 'Links',
      of: [{ type: 'ToCLink' }]
    }
  ],
  preview: {
    select: {
      label: 'label',
      pageLabel: 'target.label'
    },
    prepare({ label, pageLabel }) {
      const title = label ?? pageLabel

      return {
        title: coalesceLabel(title),
        subtitle: "Seksjon"
      }
    },
  },
})