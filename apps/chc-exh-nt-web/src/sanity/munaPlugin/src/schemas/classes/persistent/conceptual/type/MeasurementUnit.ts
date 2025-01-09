import { FaTag } from 'react-icons/fa'
import { coalesceLabel } from '../../../../../helpers/coalesceLabel'
import { defaultFieldsets } from '../../../../../fieldsets/defaultFieldsets'
import { accessState, altLabel, editorialState, label } from '../../../../properties/datatype'
import { defineType } from 'sanity'

export default defineType({
  name: 'MeasurementUnit',
  title: 'Måleenhet',
  type: 'document',
  initialValue: {
    editorialState: 'published',
    accessState: 'open',
  },
  icon: FaTag,
  fieldsets: defaultFieldsets,
  fields: [
    editorialState,
    accessState,
    label,
    altLabel,
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
})
