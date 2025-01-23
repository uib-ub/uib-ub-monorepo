import { defineType } from 'sanity'
import { defaultFieldsets } from '../../../../fieldsets/defaultFieldsets'
import { carriedOutBy, referredToBy, timespan, tookPlaceAt, usedGeneralTechnique, usedObjectOfType, usedSpecificObject, usedSpecificTechnique } from '../../../properties/object'

export default defineType({
  name: 'Treatment',
  title: 'Behandling',
  type: 'object',
  fieldsets: defaultFieldsets,
  fields: [
    carriedOutBy,
    timespan,
    tookPlaceAt,
    referredToBy,
    usedGeneralTechnique,
    usedSpecificTechnique,
    usedObjectOfType,
    usedSpecificObject,
    {
      name: 'assessedBy',
      title: 'Vurdert av',
      description: 'Legg til en vurdering av behandlingen. Var det en suksess?',
      type: 'array',
      of: [{ type: 'TreatmentAssessment' }],
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
  ],
  preview: {
    select: {
      date: 'timespan',
    },
    prepare(selection) {
      const { date } = selection
      return {
        title: 'Behandling' + (date ? ', datert ' + date : ''),
      }
    },
  },
})
