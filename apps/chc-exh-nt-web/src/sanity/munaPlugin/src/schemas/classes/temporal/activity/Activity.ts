import { FiActivity } from 'react-icons/fi'
import { defineType } from 'sanity'
import { coalesceLabel } from '../../../../helpers'
import {
  label, accessState, editorialState,
} from '../../../properties/datatype'
import {
  carriedOutBy, contributionAssignedBy, hadParticipant, identifiedBy, referredToBy, timespanSingleton, tookPlaceAt, usedGeneralTechnique, usedObjectOfType, usedSpecificObject, usedSpecificTechnique
} from '../../../properties/object'

export default defineType({
  name: 'Activity',
  title: 'Activity',
  type: 'document',
  icon: FiActivity,
  fieldsets: [
    {
      name: 'state',
      title: 'Status',
      options: { collapsible: true, collapsed: false, columns: 2 },
    },
    {
      name: 'core',
      title: 'Basic metadata',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'technique',
      title: 'Felt relatert til teknikk',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'purpose',
      title: 'Formål med aktiviteten',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'continuation',
      title: 'Fortsatt av eller fortsetter...',
      options: { collapsible: true, collapsed: false, columns: 2 },
    },
  ],
  groups: [
    {
      name: 'core',
      title: 'Kjernemetadata',
      default: true
    },
    {
      name: 'continuation',
      title: 'Tid',
    },
    {
      name: 'technique',
      title: 'Teknikk'
    },
    {
      name: 'purpose',
      title: 'Formål'
    },
  ],
  fields: [
    {
      ...editorialState,
      group: 'core',
    },
    {
      ...accessState,
      group: 'core',
    },
    {
      name: 'subType',
      title: 'What kind of activity?',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: 'Beginning of existence', value: 'crm:BeginningOfExistence' },
          { title: 'Production', value: 'crm:Production' },
          { title: 'Destruction', value: 'crm:Destruction' },
          { title: 'Transformation', value: 'crm:Transformation' },
        ]
      },
      group: 'core',
    },
    {
      ...label,
      validation: undefined,
      group: 'core',
    },
    {
      ...contributionAssignedBy,
      group: 'core',
    },
    {
      name: 'hasType',
      title: 'Aktivitetstype',
      group: 'core',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'ActivityType' }],
        },
      ],
    },
    identifiedBy,
    {
      ...referredToBy,
      group: 'core',
    },
    {
      ...timespanSingleton,
      group: ['core', 'continuation']
    },
    {
      ...carriedOutBy,
      group: 'core',
    },
    {
      ...hadParticipant,
      group: 'core',
    },
    {
      ...tookPlaceAt,
      group: 'core'
    },
    {
      name: 'consistsOf',
      title: 'Underaktiviteter',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'Activity' }] }],
      options: {
        semanticSanity: {
          '@container': '@list',
          '@type': '@id'
        }
      },
    },
    {
      name: 'continued',
      title: 'Fortsatte',
      fieldset: 'continuation',
      group: 'continuation',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'Activity' }] }],
    },
    {
      name: 'wasContinuedBy',
      title: 'Ble fortsatt av',
      fieldset: 'continuation',
      group: 'continuation',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'Activity' }] }],
    },
    {
      name: 'influencedBy',
      title: 'Påvirket av',
      description: '',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'HumanMadeObject' },
            { type: 'Event' },
            { type: 'Place' },
            { type: 'Work' },
            { type: 'Actor' }
          ],
        },
      ],
    },
    {
      ...usedGeneralTechnique,
      fieldset: 'technique',
      group: 'technique',
    },
    {
      ...usedSpecificTechnique,
      fieldset: 'technique',
      group: 'technique',
    },
    {
      ...usedObjectOfType,
      fieldset: 'technique',
      group: 'technique',
    },
    {
      ...usedSpecificObject,
      fieldset: 'technique',
      group: 'technique',
    },
    {
      name: 'generalPurpose',
      title: 'Generelt formål',
      description: '',
      fieldset: 'purpose',
      group: 'purpose',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'Concept' }],
        },
      ],
    },
    {
      name: 'motivatedBy',
      title: 'Motivert av',
      description: '',
      fieldset: 'purpose',
      group: 'purpose',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'DesignOrProcedure' },
            { type: 'Event' },
            { type: 'Report' },
            { type: 'Acquisition' },
            { type: 'Exhibition' },
            { type: 'Project' },
          ],
        },
      ],
    },
    {
      name: 'intendedUseOf',
      title: 'Forutså bruk av',
      description: '',
      fieldset: 'purpose',
      group: 'purpose',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'HumanMadeObject' }] }],
    },
  ],
  preview: {
    select: {
      title: 'label',
      edtf: 'timespan.edtf',
      type: 'hasType.0.label',
    },
    prepare(selection) {
      const { title, type, edtf } = selection

      return {
        title: coalesceLabel(title),
        subtitle: `${coalesceLabel(type)} ${edtf ?? ''}`,
      }
    },
  },
})
