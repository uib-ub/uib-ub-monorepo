import { timespan, tookPlaceAt, referredToBy, motivatedBy, featured, labelSingleton, formed, formedFrom, timespanSingleton } from '../props'
import { defaultFieldsets } from '../fieldsets'
import { coalesceLabel } from '../helpers'

var capitalize = require('capitalize')

// Implisit 'wasFormedBy' to parent actor

export const Formation = {
  name: 'Formation',
  type: 'document',
  title: 'Opprettelse',
  titleEN: 'Formation',
  liveEdit: true,
  fieldsets: defaultFieldsets,
  fields: [
    labelSingleton,
    featured,
    referredToBy,
    timespanSingleton,
    formed,
    formedFrom,
    motivatedBy,
    tookPlaceAt,
  ],
  preview: {
    select: {
      label: 'label',
      type: '_type',
      edtf: 'timespan.edtf',
      formed: 'formed.label',
    },
    prepare(selection) {
      const { label, edtf } = selection
      return {
        title: label,
        subtitle: edtf,
      }
    },
  },
}
