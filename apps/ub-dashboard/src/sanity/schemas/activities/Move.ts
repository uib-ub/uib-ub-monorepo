import { FaTruckLoading } from 'react-icons/fa'
import {
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
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'Actor' }
          ],
        },
      ],
    },
    {
      name: 'movedFrom',
      title: 'Flyttet fra',
      type: 'reference',
      to: [
        { type: 'Place' },
      ],
    },
    {
      name: 'movedTo',
      title: 'Flyttet til',
      type: 'reference',
      to: [
        { type: 'Place' },
      ],
    },
    motivatedBy,
  ],
  preview: {
    select: {
      title: 'label',
      timespan: 'timespan.edtf',
    },
    prepare(selection: any) {
      const { title, timespan } = selection

      return {
        title: title,
        subtitle: timespan,
      }
    },
  },
}
