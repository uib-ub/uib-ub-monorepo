import { defineType } from 'sanity'
import { coalesceLabel } from "../../../helpers"
import { labelSingleton } from '../../properties/datatype'

export default defineType({
  name: 'PublicationBlock',
  title: 'Publikasjon',
  type: 'object',
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    {
      ...labelSingleton,
      validation: undefined,
    },
    {
      name: 'description',
      title: 'Beskrivelse',
      type: 'simpleBlockContent',
    },
    {
      name: 'internalRef',
      title: 'Object in the studio',
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
