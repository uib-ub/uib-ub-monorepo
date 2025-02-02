import { carriedOutBy, timespan, tookPlaceAt, referredToBy, labelSingleton, deathOf } from '../props'
import { defaultFieldsets } from '../fieldsets'

export const Death = {
  name: 'Death',
  type: 'document',
  title: 'Død',
  liveEdit: true,
  fieldsets: defaultFieldsets,
  fields: [labelSingleton, deathOf, carriedOutBy, timespan, tookPlaceAt, referredToBy],
  preview: {
    select: {
      actor: 'deathOf.label',
      edtf: 'timespan.edtf',
    },
    prepare(selection: any) {
      const { actor, edtf } = selection
      return {
        title: `${actor ?? '???'} går bort`,
        subtitle: edtf,
      }
    },
  },
}
