import { editorialState, accessState } from '../props'
import { defaultFieldsets } from '../fieldsets'
import { coalesceLabel } from '../helpers'

export const LinguisticObject = {
  name: 'LinguisticObject',
  type: 'object',
  title: 'Tekst',
  fieldsets: defaultFieldsets,
  initialValue: {
    editorialState: 'published',
    accessState: 'open',
  },
  fields: [
    editorialState,
    accessState,
    {
      name: 'body',
      title: 'Tekst',
      type: 'blockContent',
    },
  ],
  preview: {
    select: {
      type: 'hasType.0.label',
      blocks: 'body',
    },
    prepare(selection: any) {
      const { type, blocks } = selection

      return {
        title: blocks?.length
          ? blocks[0].children
            .filter((child: any) => child._type === 'span')
            .map((span: any) => span.text)
            .join('')
          : 'No content',
        subtitle: `${type ? coalesceLabel(type) + ' på ' : ''}`,
      }
    },
  },
}
