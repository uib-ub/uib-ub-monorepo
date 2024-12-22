import { RiMapPinLine } from 'react-icons/ri'
import { defineType } from 'sanity'
import { defaultFieldsets } from '../../../fieldsets/defaultFieldsets'
import { coalesceLabel } from '../../../helpers'
import { accessState, definedBy, editorialState, label } from '../../properties/datatype'
import { definedByGeoJSON, identifiedBy, referredToBy } from '../../properties/object'

export default defineType({
  name: 'Place',
  type: 'document',
  title: 'Sted',
  initialValue: {
    editorialState: 'published',
    accessState: 'open',
  },
  icon: RiMapPinLine,
  fieldsets: defaultFieldsets,
  fields: [
    editorialState,
    accessState,
    label,
    identifiedBy,
    {
      name: 'hasType',
      title: 'Klassifisert som',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'PlaceType' }],
        },
      ],
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },

    referredToBy,
    definedBy,
    definedByGeoJSON,
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
