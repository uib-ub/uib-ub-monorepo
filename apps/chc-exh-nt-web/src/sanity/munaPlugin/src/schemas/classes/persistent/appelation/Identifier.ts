import { defineType } from 'sanity'
import { defaultFieldsets } from '../../../../fieldsets/defaultFieldsets'
import { coalesceLabel } from '../../../../helpers/index'
import { referredToBy, timespanSingleton } from '../../../properties/object'

export default defineType({
  name: 'Identifier',
  type: 'object',
  title: 'Identifikator',
  fieldsets: defaultFieldsets,
  fields: [
    {
      name: 'content',
      title: 'Identifikator',
      type: 'string',
    },
    {
      name: 'hasType',
      title: 'Klassifisert som',
      type: 'reference',
      to: [{ type: 'IdentifierType' }],
      validation: (Rule) => Rule.required(),
      options: {
        semanticSanity: {
          '@type': '@id'
        }
      },
    },
    timespanSingleton,
    referredToBy,
  ],
  preview: {
    select: {
      title: 'content',
      type: 'hasType.label',
    },
    prepare(selection) {
      const { title, type } = selection
      return {
        title: title,
        subtitle: coalesceLabel(type),
      }
    },
  },
})
