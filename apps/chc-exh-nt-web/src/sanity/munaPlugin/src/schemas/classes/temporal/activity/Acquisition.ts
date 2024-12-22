import { FaGifts } from 'react-icons/fa'
import { defineType } from 'sanity'
import { coalesceLabel } from '../../../../helpers/coalesceLabel'
import { accessState, editorialState, labelSingleton } from '../../../properties/datatype'
import {
  identifiedBy, referredToBy, subjectOf, timespanSingleton, transferredTitleFrom, transferredTitleOf, transferredTitleTo
} from '../../../properties/object'

export default defineType({
  name: 'Acquisition',
  title: 'Acquisition',
  type: 'document',
  initialValue: {
    editorialState: 'review',
    accessState: 'secret',
  },
  icon: FaGifts,
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
      name: 'ownership',
      title: 'Felt relatert til eierskap',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    editorialState,
    accessState,
    labelSingleton,
    {
      ...identifiedBy,
      fieldset: 'core',
    },
    {
      ...referredToBy,
      fieldset: 'core',
    },
    {
      ...subjectOf,
      fieldset: 'core',
    },
    {
      name: 'hasType',
      title: 'Klassifisert som',
      type: 'array',
      fieldset: 'core',
      of: [
        {
          type: 'reference',
          to: [{ type: 'AcquisitionType' }],
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
    {
      ...transferredTitleOf,
      fieldset: 'ownership',
    },
    {
      ...transferredTitleFrom,
      fieldset: 'ownership',
    },
    {
      ...transferredTitleTo,
      fieldset: 'ownership',
    },
    {
      name: 'consistsOf',
      title: 'Underakkvisisasjon',
      description: 'Events and activities connected to this object',
      type: 'array',
      of: [{ type: 'Acquisition' }],
      options: {
        modal: 'fullscreen',
        semanticSanity: {
          '@container': '@list',
          '@type': '@id'
        }
      },
    },
    {
      name: 'documentedIn',
      title: 'Documented in',
      type: 'array',
      of: [{ type: 'file' }],
      options: {
        modal: 'fullscreen',
        semanticSanity: {
          exclude: false
        }
      },
    },
  ],
  preview: {
    select: {
      type: 'hasType.0.label',
      title: 'label',
      published: 'accessState',
    },
    prepare(selection) {
      const { type, title, published } = selection
      const secret = published === 'secret' ? '🔒' : ''

      return {
        title: coalesceLabel(title),
        subtitle: secret + type,
      }
    },
  },
})
