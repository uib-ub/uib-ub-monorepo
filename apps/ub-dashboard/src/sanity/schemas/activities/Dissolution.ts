import { timespan, tookPlaceAt, referredToBy, motivatedBy, featured, labelSingleton, dissolved } from '../props'
import { defaultFieldsets } from '../fieldsets'
import { coalesceLabel } from '../helpers/index'

// Implisit 'wasFormedBy' to parent Actor

export const Dissolution = {
  name: 'Dissolution',
  type: 'document',
  title: 'Oppløsing',
  liveEdit: true,
  fieldsets: defaultFieldsets,
  fields: [
    labelSingleton,
    featured,
    dissolved,
    timespan,
    tookPlaceAt,
    motivatedBy,
    referredToBy,
  ],
  preview: {
    select: {
      label: 'label',
      edtf: 'timespan.edtf',
      dissolved: 'dissolved.label',
    },
    prepare(selection: any) {
      const { label, edtf, dissolved } = selection
      return {
        title: label ?? `Oppløsningen av ${dissolved ? coalesceLabel(dissolved) : ''}`,
        subtitle: edtf,
      }
    },
  },
}
