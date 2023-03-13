import { BiGrid } from 'react-icons/bi'
import { defineType } from 'sanity'

export default defineType({
  name: 'GridBlock',
  type: 'object',
  title: 'Rutenett',
  titleEN: 'Grid',
  description: 'Et rutenett (grid) med tekstinnhold',
  icon: BiGrid,
  fieldsets: [
    {
      name: 'subtitle',
      title: 'Undertittel',
      options: { collapsible: true, collapsed: true },
    },
  ],
  options: {
    semanticSanity: {
      exclude: true
    }
  },
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      titleEN: 'Disabled',
      type: 'boolean',
    },
    {
      name: 'label',
      title: 'Tittel',
      titleEN: 'Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Beskrivelse',
      titleEN: 'Description',
      type: 'simpleBlockContent',
    },
    {
      name: 'items',
      title: 'Blokker',
      titleEN: 'Items',
      type: 'array',
      of: [
        { type: 'CardBlock' },
        { type: 'ObjectBlockItem' },
      ],
    },
    {
      name: 'anchor',
      title: 'Anker',
      titleEN: 'Anchor',
      description: 'Brukes til å lage en ankerlenke',
      descriptionEN: 'Used for anchor link',
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
