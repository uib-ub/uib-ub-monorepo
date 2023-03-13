import { FaUser } from 'react-icons/fa'
import { defineType } from 'sanity'
import { coalesceLabel } from '../../../../helpers'
import { accessState, editorialState, homepage, label, shortDescription, sortLabel } from '../../../properties/datatype'
import {
  identifiedBy, image, inDataset, memberOf, referredToBy, wasOutputOf
} from '../../../properties/object'

export default defineType({
  name: 'Actor',
  title: 'Actor',
  type: 'document',
  initialValue: {
    editorialState: 'review',
    accessState: 'secret',
  },
  icon: FaUser,
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
      name: 'representation',
      title: 'Hovedbilde og IIIF manifest',
      options: { collapsible: true, collapsed: false },
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
    sortLabel,
    shortDescription,
    homepage,
    {
      ...identifiedBy,
      fieldset: 'core',
    },
    {
      ...referredToBy,
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
          to: [{ type: 'ActorType' }],
        },
      ],
      validation: Rule => Rule.min(1).warning('Du bør ha "Person" eller "Gruppe" som første type!'),
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
    {
      name: 'activityStream',
      title: 'Aktivitetsstrøm',
      titleEN: 'Activity stream',
      description:
        'En aktivitetsstrøm samler alle hendelser knyttet til denne aktøren. Fødsel og død er "inline" til personen, mens andre aktiviteter som ekteskap er egne dokument.',
      descriptionEN: 'Add all known events this smuck did',
      type: 'array',
      of: [
        { type: 'Birth' },
        { type: 'reference', to: [{ type: 'Activity' }, { type: 'Event' }] },
        { type: 'Move' },
        { type: 'Joining' },
        { type: 'Leaving' },
        { type: 'Death' },
      ],
      options: {
        modal: 'fullscreen',
        semanticSanity: {
          '@container': '@list',
          '@type': '@id'
        }
      },
    },
    memberOf,
    {
      ...image,
      fieldset: 'representation',
    },
    inDataset,
    wasOutputOf
  ],
  preview: {
    select: {
      label: 'label',
      type: 'hasType.0.label',
      edtf: 'activityStream.0.timespan.0.edtf',
      media: 'image',
      imported: 'wasOutputOf'
    },
    prepare({ label, type, media, imported, edtf }) {
      const wasImported = imported ? `Importert fra ${imported.hasSender.label}` : ''

      return {
        title: coalesceLabel(label),
        subtitle: `${coalesceLabel(type)}: ${edtf}, ${wasImported}`,
        media: media,
      }
    },
  },
})
