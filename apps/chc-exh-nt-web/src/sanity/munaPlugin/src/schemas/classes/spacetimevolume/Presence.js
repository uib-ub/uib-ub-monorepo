import { defineType } from 'sanity'
import { coalesceLabel } from '../../../helpers'
import { label } from '../../properties/datatype'
import { definedByGeoJSON } from '../../properties/object'

export default defineType({
  name: 'Presence',
  type: 'object',
  title: 'Tilstedeværelse',
  titleEN: 'Presence',
  description:
    'Used to define temporal snapshots at a particular time-span, such as the extent of the Roman Empire at 33 B.C.',
  fieldsets: [
    {
      name: 'core',
      title: 'coresregistrering',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    label,
    {
      name: 'description',
      title: 'Beskrivelse',
      description: 'A shortish description',
      type: 'LocaleBlockSimple',
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
    {
      name: 'temporalProjection',
      title: 'Tidsspenn',
      type: 'array',
      of: [{ type: 'Timespan' }],
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
    {
      name: 'spatialProjection',
      title: 'Fant sted ved',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'Place' }] }],
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
    definedByGeoJSON,
  ],
  preview: {
    select: {
      title: 'label',
    },
    prepare(selection) {
      const { title } = selection
      return {
        title: coalesceLabel(title),
      }
    },
  },
})
