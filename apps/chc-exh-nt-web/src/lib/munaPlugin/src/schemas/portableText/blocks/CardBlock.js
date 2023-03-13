import { defineType } from 'sanity'
import { coalesceLabel } from "../../../helpers"
import { labelSingleton } from '../../properties/datatype'

export default defineType({
  name: 'CardBlock',
  title: 'Kort blokk',
  type: 'object',
  options: {
    semanticSanity: {
      exclude: true
    }
  },
  fieldsets: [
    {
      title: 'Lenke',
      titleEN: 'Link',
      name: 'link',
      description: 'Bare den første av disse tre verdiene vil bli brukt',
      descriptionEN: 'Only the first value of these will be used',
    },
  ],
  fields: [
    labelSingleton,
    {
      name: 'description',
      title: 'Beskrivelse',
      type: 'simpleBlockContent',
    },
    {
      name: 'illustration',
      title: 'Illustrasjonsbilde',
      type: 'Illustration',
    },
    {
      name: 'landingPageRoute',
      title: 'Nettside',
      description: 'Referanse til en "route" i datasettet',
      fieldset: 'link',
      type: 'reference',
      to: [{ type: 'Route' }],
    },
    {
      name: 'route',
      title: 'Sti',
      description: 'Referense til en "path" i frontend, som ikke er i Studioet',
      fieldset: 'link',
      type: 'string',
    },
    {
      name: 'link',
      title: 'Ekstern lenke',
      description: 'Example: https://www.uib.no/ub',
      fieldset: 'link',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'label',
      eventTitle: 'item.label',
      media: 'image',
      eventMedia: 'item.image',
    },
    prepare({ title, eventTitle, media, eventMedia }) {
      return {
        title: coalesceLabel(title) ?? coalesceLabel(eventTitle),
        subtitle: 'Event',
        media: media ?? eventMedia,
      }
    },
  },
})
