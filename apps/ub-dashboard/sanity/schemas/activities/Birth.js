import { carriedOutBy, tookPlaceAt, referredToBy, timespanSingleton, labelSingleton, birthOf } from '../props'
import { defaultFieldsets } from '../fieldsets'

var capitalize = require('capitalize')

export const Birth = {
  name: 'Birth',
  type: 'document',
  title: 'Fødsel',
  titleEN: 'Birth',
  liveEdit: true,
  fieldsets: defaultFieldsets,
  fields: [labelSingleton, birthOf, carriedOutBy, timespanSingleton, tookPlaceAt, referredToBy],
  preview: {
    select: {
      edts: 'timespan.edtf',
      blocks: 'description',
      type: '_type',
    },
    prepare(selection) {
      const { type, edtf } = selection
      return {
        title: `${capitalize(type)}`,
        subtitle: edtf,
      }
    },
  },
}
