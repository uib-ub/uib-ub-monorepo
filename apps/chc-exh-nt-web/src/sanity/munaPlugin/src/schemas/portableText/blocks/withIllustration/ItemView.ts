import { defineType } from 'sanity'
import { image } from '../../../properties/object'

export default defineType({
  type: 'object',
  name: 'ItemView',
  title: 'Visning',
  fieldsets: [
    {
      name: 'internal',
      title: 'Internt objekt',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'external',
      title: 'Eksternt objekt',
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
      name: 'view',
      title: 'Visningsvalg',
      description: 'Velg enkeltside-visning eller galleri med alle objektets bilder. Bokvisning er standard.',
      type: 'string',
      options: {
        list: [
          { title: 'Zoom', value: 'zoom' },
          { title: 'Book', value: 'book' },
          { title: 'Single', value: 'single' },
          { title: 'Gallery', value: 'gallery' },
        ],
      },
    },
    {
      name: 'manifestRef',
      title: 'Manifest',
      type: 'reference',
      to: [{ type: 'HumanMadeObject' }],
      fieldset: 'internal',
    },
    {
      name: 'canvasUrl',
      title: 'Canvas URL',
      type: 'url',
    },
    image,
    {
      name: 'manifestUrl',
      title: 'Manifest adresse',
      type: 'url',
      fieldset: 'external',
    },
    {
      name: 'source',
      title: 'Kilde',
      description: 'Legg til kilde eller kreditering',
      type: 'simpleBlockContent',
    },
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'label',
      media: 'illustration',
      disabled: 'disabled',
    },
    prepare({ title, media, disabled }) {
      return {
        title: title,
        subtitle: `${disabled ? 'Avslått: ' : ''}Illustrasjon`,
        media: media?.image,
      }
    },
  },
})
