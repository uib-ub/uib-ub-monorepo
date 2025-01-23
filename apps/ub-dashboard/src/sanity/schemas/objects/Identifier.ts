import { referredToBy, timespan } from '../props'
import { defaultFieldsets } from '../fieldsets'
import { coalesceLabel } from '../helpers'

export const Identifier = {
  name: 'Identifier',
  type: 'object',
  title: 'Identifikator',
  fieldsets: defaultFieldsets,
  fields: [
    {
      name: 'content',
      title: 'Identifikator',
      titleEN: 'Identifier',
      type: 'string',
    },
    {
      name: 'hasType',
      title: 'Klassifisert som',
      type: 'reference',
      to: [{ type: 'IdentifierType' }],
      validation: (Rule: any) => Rule.required(),
      options: {
        semanticSanity: {
          '@type': '@id'
        }
      },
    },
    timespan,
    referredToBy,
  ],
  preview: {
    select: {
      title: 'content',
      type: 'hasType.label',
    },
    prepare(selection: any) {
      const { title, type } = selection
      return {
        title: title,
        subtitle: coalesceLabel(type),
      }
    },
  },
}
