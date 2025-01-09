import { GiShipWreck } from 'react-icons/gi'
import { defineType } from 'sanity'
import { featured } from '../../../properties/datatype'
import { carriedOutBy, timespanSingleton, tookPlaceAt } from '../../../properties/object'

export default defineType({
  name: 'Destruction',
  type: 'document',
  title: 'Ødeleggelse',
  icon: GiShipWreck,
  fields: [
    featured,
    {
      name: 'hasType',
      title: 'Klassifisert som',
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
    carriedOutBy,
    timespanSingleton,
    tookPlaceAt,
  ],
  preview: {
    select: {
      date: 'productionDate',
    },
    prepare(selection) {
      const { date } = selection
      return {
        title: 'Ending' + (date ? ', dated ' + date : ''),
      }
    },
  },
})
