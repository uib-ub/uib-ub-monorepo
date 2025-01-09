import { defineType } from 'sanity'
import { coalesceLabel } from "../../../helpers"
import { image } from "../../properties/object"

export default defineType({
  name: 'EventBlock',
  type: 'object',
  title: 'Hendelse',
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    {
      name: 'items',
      title: 'Objekt',
      type: 'reference',
      to: [{ type: 'Event' }],
    },
    {
      name: 'label',
      title: 'Tittel eller navn',
      description: 'Om feltet benyttes vil den overstyre hendelsens navn',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Beskrivelse',
      description: 'Om feltet benyttes vil den overstyre hendelsens beskrivelse',
      type: 'simpleBlockContent',
    },
    image,
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
