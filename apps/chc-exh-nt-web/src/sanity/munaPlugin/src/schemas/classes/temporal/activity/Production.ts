import { GiFactory } from 'react-icons/gi'
import { defineType } from 'sanity'
import { defaultFieldsets } from '../../../../fieldsets/defaultFieldsets'
import { coalesceLabel } from '../../../../helpers'
import {
  featured
} from '../../../properties/datatype'
import {
  contributionAssignedBy, referredToBy, timespanSingleton, tookPlaceAt, usedGeneralTechnique, usedSpecificTechnique
} from '../../../properties/object'


export default defineType({
  name: 'Production',
  type: 'document',
  title: 'Production',
  icon: GiFactory,
  fieldsets: defaultFieldsets,
  fields: [
    featured,
    {
      name: 'consistsOf',
      title: 'Underaktiviteter',
      description: 'OBS! Det er mulig å nøste flere produksjoner under hverandre per i dag, men bare bruk ett nivå!',
      type: 'array',
      of: [{ type: 'Production' }],
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
      validation: Rule => Rule.min(2).warning('Prodcution with multiple actors must have at least 2 actors. If there is only one actor do not use "sub-activities"')
    },
    {
      name: 'hasType',
      title: 'Klassifisert som',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'ActivityType' }],
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
      ...contributionAssignedBy,
      hidden: ({ value, parent }) => !value && parent?.consistsOf,
    },
    {
      ...timespanSingleton,
    },
    {
      ...tookPlaceAt,
    },
    {
      ...referredToBy,
    },
    {
      name: 'hasModified',
      title: 'Har modifisert',
      description: 'A production can modify an existing object',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'HumanMadeObject' }] }],
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
    {
      ...usedGeneralTechnique,
      hidden: ({ value, parent }) => !value && parent?.consistsOf,
    },
    {
      ...usedSpecificTechnique,
      hidden: ({ value, parent }) => !value && parent?.consistsOf,
    }
  ],
  preview: {
    select: {
      contributor: 'contributionAssignedBy.0.assignedActor.label',
      contributorName: 'contributionAssignedBy.0.usedName.content',
      mainRole: 'contributionAssignedBy.0.assignedRole.0.label',
      consistsOf: 'consistsOf',
      edtf: 'timespan.edtf',
    },
    prepare(selection) {
      const { contributor, contributorName, mainRole, consistsOf, edtf } = selection
      const title = `Production, by ${coalesceLabel(contributor) || contributorName || 'unknown'} ${mainRole ? `(${coalesceLabel(mainRole)})` : ''}`
      const multiPartProduction = consistsOf ? `${consistsOf.length} participants in the production` : null

      return {
        title: multiPartProduction ?? title,
        subtitle: edtf
      }
    },
  },
})
