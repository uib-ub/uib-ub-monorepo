import { FaGlasses } from 'react-icons/fa'
import { defineType } from 'sanity'
import { defaultFieldsets } from '../../../fieldsets/defaultFieldsets'
import { coalesceLabel } from '../../../helpers'
import { accessState, editorialState, labelSingleton } from '../../properties/datatype'
import { identifiedBy, language, referredToBy, tookPlaceAt } from '../../properties/object'

export default defineType({
  name: 'Exhibition',
  title: 'Exhibition',
  type: 'document',
  initialValue: {
    editorialState: 'review',
    accessState: 'secret',
  },
  icon: FaGlasses,
  fieldsets: defaultFieldsets,
  fields: [
    editorialState,
    accessState,
    labelSingleton,
    identifiedBy,
    referredToBy,
    language,
    {
      name: 'creator',
      title: 'Skaper',
      description:
        'Registrer en eller flere aktører som har skapt dette dokumentet, gjerne med hvilken rolle de hadde.',
      type: 'array',
      of: [
        {
          type: 'ContributionAssignment',
        },
      ],
      options: {
        semanticSanity: {
          '@container': '@list',
          '@type': '@id'
        }
      },
    },
    {
      name: 'activityStream',
      title: 'Aktivitetsstrøm',
      description: 'Events and activities connected to this object',
      type: 'array',
      of: [
        { type: 'Creation' },
        { type: 'Move' }
      ],
      options: {
        semanticSanity: {
          '@container': '@list',
          '@type': '@id'
        }
      },
    },
    tookPlaceAt,
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
