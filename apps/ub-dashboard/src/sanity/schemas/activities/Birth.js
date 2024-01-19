import { carriedOutBy, tookPlaceAt, referredToBy, timespanSingleton, labelSingleton, birthOf } from '../props'
import { defaultFieldsets } from '../fieldsets'

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
      actor: 'birthOf.0.label',
      edtf: 'timespan.edtf',
    },
    prepare(selection) {
      const { actor, edtf } = selection
      return {
        title: `${actor ?? '???'} blir født`,
        subtitle: edtf,
      }
    },
  },
}
