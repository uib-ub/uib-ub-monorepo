import { defineType } from 'sanity'
import { coalesceLabel } from '../../../../../helpers'

export default defineType({
  title: 'TOC link',
  name: 'ToCLink',
  type: 'object',
  fields: [
    {
      type: 'reference',
      name: 'target',
      title: 'Target',
      to: [
        { type: 'Route' },
        // etc
      ],
    },
    {
      type: 'LocalizedString',
      name: 'label',
      title: 'Title',
      // to override title from referenced items
    },
    {
      type: 'array',
      name: 'children',
      title: 'Children',
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
        subtitle: "Lenke"
      }
    },
  },
})