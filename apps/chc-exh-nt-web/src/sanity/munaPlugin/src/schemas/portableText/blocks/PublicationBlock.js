import { defineType } from 'sanity'
import { coalesceLabel } from "../../../helpers"
import { labelSingleton } from '../../properties/datatype'
import { image } from '../../properties/object'

export default defineType({
  name: 'PublicationBlock',
  title: 'Publikasjon',
  type: 'object',
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
      ...labelSingleton,
      validation: null,
    },
    {
      name: 'description',
      title: 'Beskrivelse',
      titleEN: 'Description',
      type: 'simpleBlockContent',
    },
    {
      name: 'internalRef',
      title: 'Object in the studio',
      titleEN: 'Manifest',
      type: 'reference',
      to: [{ type: 'HumanMadeObject' }],
    },
  ],
  preview: {
    select: {
      title: 'label',
      internalRefLabel: 'internalRef.label',
      object: 'internalRef.image',
    },
    prepare({ title, internalRefLabel, object }) {
      const objectLabel = coalesceLabel(internalRefLabel)

      return {
        title: title ?? 'No label',
        subtitle: objectLabel,
        media: object,
      }
    },
  },
})
