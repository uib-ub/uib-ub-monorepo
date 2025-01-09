import { timespan, referredToBy } from '../props'
import { defaultFieldsets } from '../fieldsets'
import { coalesceLabel } from '../helpers'

export const Name = {
  name: 'Name',
  type: 'object',
  title: 'Navn',
  fieldsets: defaultFieldsets,
  fields: [
    {
      name: 'content',
      title: 'Navn',
      type: 'string',
    },
    {
      name: 'hasType',
      title: 'Type',
      type: 'reference',
      validation: (Rule: any) => Rule.required(),
      to: [{ type: 'NameType' }],
      options: {
        semanticSanity: {
          '@type': '@id'
        }
      },
    },
    {
      name: 'part',
      title: 'Deler',
      type: 'array',
      of: [{ type: 'Name' }],
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
    {
      name: 'language',
      title: 'Språk',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'Language' }] }],
      options: {
        semanticSanity: {
          '@container': '@set',
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
      lang: 'language.0.label',
    },
    prepare(selection: any) {
      const { title, type, lang } = selection
      return {
        title: coalesceLabel(title),
        subtitle: `${coalesceLabel(type)} ${lang ? 'på ' + coalesceLabel(lang) : ''}`,
      }
    },
  },
}
