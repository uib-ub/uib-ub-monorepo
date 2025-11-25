import { tookPlaceAt, referredToBy, motivatedBy, featured, labelSingleton, formed, formedFrom, timespanSingleton } from '../props'
import { defaultFieldsets } from '../fieldsets'

// Implisit 'wasFormedBy' to parent actor

export const Formation = {
  name: 'Formation',
  type: 'document',
  title: 'Opprettelse',
  liveEdit: true,
  fieldsets: defaultFieldsets,
  fields: [
    labelSingleton,
    featured,
    timespanSingleton,
    formed,
    formedFrom,
    motivatedBy,
    tookPlaceAt,
    referredToBy,
  ],
  preview: {
    select: {
      label: 'label',
      type: '_type',
      edtf: 'timespan.edtf',
      formed: 'formed.label',
    },
    prepare(selection: any) {
      const { label, edtf } = selection
      return {
        title: label,
        subtitle: edtf,
      }
    },
  },
}
