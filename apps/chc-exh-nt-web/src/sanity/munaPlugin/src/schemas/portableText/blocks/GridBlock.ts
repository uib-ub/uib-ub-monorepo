import { BiGrid } from 'react-icons/bi'
import { defineType } from 'sanity'

export default defineType({
  name: 'GridBlock',
  type: 'object',
  title: 'Rutenett',
  description: 'Et rutenett (grid) med tekstinnhold',
  icon: BiGrid,
  fieldsets: [
    {
      name: 'subtitle',
      title: 'Undertittel',
      options: { collapsible: true, collapsed: true },
    },
  ],
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
      name: 'description',
      title: 'Beskrivelse',
      type: 'simpleBlockContent',
    },
    {
      name: 'items',
      title: 'Blokker',
      type: 'array',
      of: [
        { type: 'CardBlock' },
        { type: 'ObjectBlockItem' },
      ],
    },
    {
      name: 'anchor',
      title: 'Anker',
      description: 'Brukes til å lage en ankerlenke',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'label'
    },
    prepare({ title }) {
      return {
        title,
        subtitle: 'Grid'
      }
    }
  }
})
