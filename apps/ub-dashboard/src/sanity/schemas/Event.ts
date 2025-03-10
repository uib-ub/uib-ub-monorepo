import { coalesceLabel } from './helpers'
import { FaCalendar } from 'react-icons/fa'
import {
  timespanSingleton,
  editorialState,
  accessState,
  referredToBy,
  labelSingleton,
  tookPlaceAt,
} from './props'

export const Event = {
  name: 'Event',
  type: 'document',
  title: 'Event',
  liveEdit: true,
  initialValue: {
    editorialState: 'review',
    accessState: 'secret',
  },
  icon: FaCalendar,
  fieldsets: [
    {
      name: 'state',
      title: 'Status',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'minimum',
      title: 'Basic metadata',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'timelineMedium',
      title: 'Hovedbilde (brukt i tidslinke)',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'relations',
      title: 'Relations to other stuff',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    editorialState,
    accessState,
    labelSingleton,
    {
      ...referredToBy,
      fieldset: 'minimum',
    },
    {
      ...timespanSingleton,
      fieldset: 'minimum',
    },
    {
      ...tookPlaceAt,
      fieldset: 'minimum',
    },
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
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'location',
      type: 'geopoint',
      title: 'Lokasjon',
      description: 'Where the hell did this happen?!',
    },
  ],
  preview: {
    select: {
      title: 'label',
      edtf: 'timespan.edtf',
      type: 'hasType.0.label',
    },
    prepare(selection: any) {
      const { title, type, edtf } = selection
      return {
        title: title,
        subtitle: `${coalesceLabel(type)} ${edtf}`,
      }
    },
  },
}
