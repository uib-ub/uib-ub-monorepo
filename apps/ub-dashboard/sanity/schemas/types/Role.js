import { FaTag } from 'react-icons/fa'
import { labelSingleton } from '../props'
import { defaultFieldsets } from '../fieldsets'
import { coalesceLabel } from '../helpers'

export const Role = {
  name: 'Role',
  title: 'Rolle',
  type: 'document',
  icon: FaTag,
  fieldsets: defaultFieldsets,
  fields: [
    labelSingleton,
  ],
  preview: {
    select: {
      title: 'label',
    },
    prepare(selection) {
      const { title } = selection
      return {
        title: coalesceLabel(title),
      }
    },
  },
}
