import { GiLightningDissipation } from 'react-icons/gi'
import { defineType } from 'sanity'
import { defaultFieldsets } from '../../../../fieldsets/defaultFieldsets'
import { featured } from '../../../properties/datatype'
import { motivatedBy, referredToBy, timespanSingleton, tookPlaceAt } from '../../../properties/object'

// Implisit 'wasFormedBy' to parent Actor

export default defineType({
  name: 'Dissolution',
  type: 'document',
  title: 'Oppløsing',
  titleEN: 'Dissolution',
  icon: GiLightningDissipation,
  fieldsets: defaultFieldsets,
  fields: [
    featured,
    {
      name: 'hasType',
      title: 'Klassifisert som',
      titleEN: 'Classified as',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'EventType' }],
        },
      ],
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
    timespanSingleton,
    tookPlaceAt,
    motivatedBy,
    referredToBy,
  ],
  preview: {
    select: {
      type: '_type',
    },
    prepare(selection) {
      const { type } = selection
      return {
        title: `${type}`,
      }
    },
  },
})
