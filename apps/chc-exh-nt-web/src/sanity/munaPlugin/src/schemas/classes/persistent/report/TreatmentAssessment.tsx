import { defineType } from 'sanity'
import { defaultFieldsets } from '../../../../fieldsets/defaultFieldsets'
import { carriedOutBy, referredToBy, timespan, tookPlaceAt } from '../../../properties/object'

export default defineType({
  name: 'TreatmentAssessment',
  title: 'Behandlingsvurdering',
  type: 'object',
  fieldsets: defaultFieldsets,
  fields: [
    carriedOutBy,
    timespan,
    {
      name: 'success',
      title: 'Suksess?',
      type: 'boolean',
    },
    tookPlaceAt,
    referredToBy,
    {
      name: 'images',
      title: 'Documentasjonsfotografi',
      description: 'Bilder som dokumenterer behandlingsresultatet.',
      fieldset: 'documentation',
      type: 'array',
      of: [{ type: 'DigitalObjectImage' }],
      options: {
        layout: 'grid',
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
  ],
  preview: {
    select: {
      date: 'productionDate',
    },
    prepare(selection) {
      const { date } = selection
      return {
        title: 'Vurdering av behandling' + (date ? ', datert ' + date : ''),
      }
    },
  },
})
