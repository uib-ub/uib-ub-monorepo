import { carriedOutBy, tookPlaceAt, referredToBy, featured, timespanSingleton, labelSingleton, broughtIntoExistence, label } from '../props'
import { defaultFieldsets } from '../fieldsets'

export const BeginningOfExistence = {
  name: 'BeginningOfExistence',
  type: 'document',
  title: 'Starten på eksistens',
  liveEdit: true,
  fieldsets: defaultFieldsets,
  initalValue: {
    label: 'Prosjektstart'
  },
  fields: [
    labelSingleton,
    broughtIntoExistence,
    carriedOutBy,
    timespanSingleton,
    tookPlaceAt,
    referredToBy
  ],
  preview: {
    select: {
      title: 'label',
      edtf: 'timespan.edtf',
    },
    prepare(selection) {
      const { title, edtf } = selection
      return {
        title: `${title ?? 'Prosjektstart'}`,
        subtitle: edtf,
      }
    },
  },
}
