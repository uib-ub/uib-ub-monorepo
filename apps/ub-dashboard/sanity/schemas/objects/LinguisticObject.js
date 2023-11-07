import { editorialState, accessState, hasType } from '../props'
import { defaultFieldsets } from '../fieldsets'
import { coalesceLabel } from '../helpers'

export const LinguisticObject = {
  name: 'LinguisticObject',
  type: 'object',
  title: 'Tekst',
  titleEN: 'Text',
  fieldsets: defaultFieldsets,
  initialValue: {
    editorialState: 'published',
    accessState: 'open',
  },
  options: {
    semanticSanity: {
      '@id': 'muna:LinguisticDocument',
    }
  },
  fields: [
    editorialState,
    accessState,
    {
      name: 'body',
      title: 'Tekst',
      titleEN: 'Body',
      type: 'blockContent',
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
  ],
  preview: {
    select: {
      type: 'hasType.0.label',
      blocks: 'body',
    },
    prepare(selection) {
      const { type, blocks } = selection

      return {
        title: blocks?.length
          ? blocks[0].children
            .filter((child) => child._type === 'span')
            .map((span) => span.text)
            .join('')
          : 'No content',
        subtitle: `${type ? coalesceLabel(type) + ' på ' : ''}`,
      }
    },
  },
}
