import { carriedOutBy, tookPlaceAt, referredToBy, timespanSingleton, labelSingleton, tookOutOfExistence } from '../props'
import { defaultFieldsets } from '../fieldsets'

export const EndOfExistence = {
  name: 'EndOfExistence',
  type: 'document',
  title: 'Slutten på eksistens',
  liveEdit: true,
  fieldsets: defaultFieldsets,
  fields: [
    labelSingleton,
    tookOutOfExistence,
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
    prepare(selection: any) {
      const { title, edtf } = selection
      return {
        title: `${title ?? 'Prosjektstart'}`,
        subtitle: edtf,
      }
    },
  },
}
