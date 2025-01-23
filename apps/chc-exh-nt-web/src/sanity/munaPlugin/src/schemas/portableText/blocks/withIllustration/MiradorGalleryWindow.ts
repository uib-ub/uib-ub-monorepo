import { defineType } from 'sanity'
import { coalesceLabel } from '../../../../helpers'

export default defineType({
  title: 'Gallery manifest',
  name: 'MiradorGalleryWindow',
  type: 'object',
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
  initialValue: {
    view: 'book'
  },
  fields: [
    {
      name: 'view',
      title: 'Visningsvalg',
      description: 'Velg enkeltside-visning eller galleri med alle objektets bilder. Bokvisning er standard.',
      type: 'string',
      options: {
        list: [
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
      name: 'manifestUrl',
      title: 'Manifest adresse',
      type: 'url',
      fieldset: 'external',
    },
    {
      name: 'canvasUrl',
      title: 'Canvas URL',
      type: 'url',
    },
    {
      name: 'canvasNumber',
      title: 'Canvas nummer',
      type: 'number',
    },
  ],
  preview: {
    select: {
      internalManifest: 'manifestRef.label',
      manifestUrl: 'manifestUrl',
      media: 'manifestRef.image',
    },
    prepare({ internalManifest, manifestUrl, media }) {
      const title = internalManifest
        ? coalesceLabel(internalManifest)
        : manifestUrl || ''

      return {
        title,
        media,
      }
    },
  },
})
