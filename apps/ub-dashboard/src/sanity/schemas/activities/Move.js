import { FaTruckLoading } from 'react-icons/fa'
import {
  timespan,
  editorialState,
  accessState,
  label,
  carriedOutBy,
  tookPlaceAt,
  referredToBy,
  motivatedBy,
  labelSingleton,
  timespanSingleton,
} from '../props'

export const Move = {
  name: 'Move',
  title: 'Move',
  type: 'document',
  liveEdit: true,
  icon: FaTruckLoading,
  fields: [
    labelSingleton,
    timespanSingleton,
    carriedOutBy,
    tookPlaceAt,
    referredToBy,
    {
      name: 'moved',
      title: 'Flyttet',
      titleEN: 'Moved',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'Actor' }
          ],
        },
      ],
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
    {
      name: 'movedFrom',
      title: 'Flyttet fra',
      titleEN: 'Moved from',
      type: 'reference',
      to: [
        { type: 'Place' },
      ],
      options: {
        semanticSanity: {
          '@type': '@id'
        }
      },
    },
    {
      name: 'movedTo',
      title: 'Flyttet til',
      titleEN: 'Moved to',
      type: 'reference',
      to: [
        { type: 'Place' },
      ],
      options: {
        semanticSanity: {
          '@type': '@id'
        }
      },
    },
    motivatedBy,
  ],
  preview: {
    select: {
      title: 'label',
      timespan: 'timespan.edtf',
    },
    prepare(selection) {
      const { title, timespan } = selection

      return {
        title: title,
        subtitle: timespan,
      }
    },
  },
}
