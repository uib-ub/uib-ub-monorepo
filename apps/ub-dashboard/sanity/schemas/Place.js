import { FaMapMarker } from 'react-icons/fa'
import {
  editorialState,
  accessState,
  label,
  referredToBy,
} from './props'
import { defaultFieldsets } from './fieldsets'
import { coalesceLabel } from './helpers'

export const Place = {
  name: 'Place',
  type: 'document',
  title: 'Sted',
  liveEdit: true,
  initialValue: {
    editorialState: 'published',
    accessState: 'open',
  },
  icon: FaMapMarker,
  fieldsets: defaultFieldsets,
  fields: [
    editorialState,
    accessState,
    label,
    referredToBy,
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
