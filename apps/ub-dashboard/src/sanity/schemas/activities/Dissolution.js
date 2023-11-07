import { timespan, tookPlaceAt, referredToBy, motivatedBy, featured, labelSingleton, dissolved } from '../props'
import { defaultFieldsets } from '../fieldsets'
import { coalesceLabel } from '../helpers'

var capitalize = require('capitalize')

// Implisit 'wasFormedBy' to parent Actor

export const Dissolution = {
  name: 'Dissolution',
  type: 'document',
  title: 'Oppløsing',
  titleEN: 'Dissolution',
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
    prepare(selection) {
      const { label, edtf, dissolved } = selection
      return {
        title: label,
        title: label ?? `Oppløsningen av ${dissolved ? coalesceLabel(dissolved) : ''}`,
        subtitle: edtf,
      }
    },
  },
}
