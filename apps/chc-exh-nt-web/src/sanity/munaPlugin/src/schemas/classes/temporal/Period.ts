import { RiMapPinTimeLine } from 'react-icons/ri'
import { defineType } from 'sanity'
import { coalesceLabel } from '../../../helpers'
import { accessState, editorialState, label } from '../../properties/datatype'
import { referredToBy, timespan, tookPlaceAt } from '../../properties/object'

export default defineType({
  name: 'Period',
  type: 'document',
  title: 'Period',
  initialValue: {
    editorialState: 'published',
    accessState: 'open',
  },
  icon: RiMapPinTimeLine,
  fieldsets: [
    {
      name: 'state',
      title: 'Status',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'core',
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
    label,
    {
      ...referredToBy,
      fieldset: 'core',
    },
    {
      ...timespan,
      fieldset: 'core',
    },
    {
      ...tookPlaceAt,
      fieldset: 'core',
    },
    {
      name: 'media',
      title: 'Media',
      type: 'DigitalObjectImage',
      fieldset: 'timelineMedium',
    },
    {
      name: 'consistsOf',
      title: 'Består av',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'Period' },
            { type: 'Event' }
          ]
        }
      ],
      options: {
        modal: 'fullscreen',
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
    {
      name: 'definingSTV',
      title: 'Definert av STV',
      type: 'SpacetimeVolume',
      options: {
        modal: 'fullscreen',
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
  ],
  preview: {
    select: {
      type: 'hasType.0.label',
      title: 'label',
    },
    prepare(selection) {
      const { title, type } = selection

      return {
        title: coalesceLabel(title),
        subtitle: coalesceLabel(type),
      }
    }
  }
})
