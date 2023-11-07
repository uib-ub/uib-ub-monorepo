import { tookPlaceAt, referredToBy, featured, timespanSingleton, labelSingleton, separatedFrom, separated } from '../props'
import { defaultFieldsets } from '../fieldsets'

export const Leaving = {
  name: 'Leaving',
  type: 'document',
  title: 'Utmeldelse',
  titleEN: 'Leaving',
  liveEdit: true,
  fieldsets: defaultFieldsets,
  fields: [
    labelSingleton,
    featured,
    referredToBy,
    timespanSingleton,
    separated,
    separatedFrom,
    tookPlaceAt,
  ],
  preview: {
    select: {
      label: 'label',
      media: 'separated.0.logo',
      edtf: 'timespan.edtf'
    },
    prepare(selection) {
      const { label, media, edtf } = selection
      return {
        title: label,
        subtitle: edtf,
        media: media
      }
    },
  },
}
