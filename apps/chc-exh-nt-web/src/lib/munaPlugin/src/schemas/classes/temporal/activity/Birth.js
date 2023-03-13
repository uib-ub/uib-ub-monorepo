import { FaBirthdayCake } from 'react-icons/fa'
import { defineType } from 'sanity'
import { defaultFieldsets } from '../../../../fieldsets/defaultFieldsets'
import { featured } from '../../../properties/datatype'
import { carriedOutBy, referredToBy, timespanSingleton, tookPlaceAt } from '../../../properties/object'

export default defineType({
  name: 'Birth',
  type: 'document',
  title: 'Fødsel',
  icon: FaBirthdayCake,
  fieldsets: defaultFieldsets,
  fields: [
    featured,
    carriedOutBy,
    timespanSingleton,
    tookPlaceAt,
    referredToBy
  ],
  preview: {
    select: {
      edtf: 'timespan.edtf',
      blocks: 'description',
      type: '_type',
    },
    prepare(selection) {
      const { type, edtf } = selection

      return {
        title: type,
        subtitle: edtf,
      }
    },
  },
})
