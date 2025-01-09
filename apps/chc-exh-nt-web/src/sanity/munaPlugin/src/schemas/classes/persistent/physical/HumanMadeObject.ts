import { FaBookDead } from 'react-icons/fa'
import { coalesceLabel } from '../../../../helpers/coalesceLabel'
import { accessState, editorialState, homepage, label, license, preferredIdentifier } from '../../../properties/datatype'
import {
  carries, composedOf, consistsOf, depicts, digitallyShownBy, file, hasCurrentOwner,
  hasFormerOrCurrentOwner, identifiedBy, image, measuredBy, presentAt, referredToBy,
  relation, showsVisualObject, subject, subjectOf, subjectOfManifest, wasOutputOf
} from '../../../properties/object'
import { depictsFunctional } from '../../../properties/object/depictsFunctional'
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'HumanMadeObject',
  type: 'document',
  title: 'Objekt',
  description: 'Menneskapte objekt',
  initialValue: {
    editorialState: 'review',
    accessState: 'secret',
  },
  icon: FaBookDead,
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
      name: 'mainImage',
      title: 'Hovedbilde',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'representation',
      title: 'Alle bilder',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'relations',
      title: 'Relations to other stuff',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'partsAndContent',
      title: 'Felt relatert til deler eller innhold',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'physicalDescription',
      title: 'Felt relatert til fysisk beskrivelse',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'ownership',
      title: 'Felt relatert til eierskap',
      options: { collapsible: true, collapsed: false },
    },
  ],
  groups: [
    {
      name: 'core',
      title: 'Core',
      default: true
    },
    {
      name: 'relations',
      title: 'Relations',
    },
    {
      name: 'partsAndContent',
      title: 'Parts',
    },
    {
      name: 'images',
      title: 'Images'
    },
    {
      name: 'physical',
      title: 'Physical'
    },
    {
      name: 'ownership',
      title: 'Ownership'
    }
  ],
  fields: [
    {
      ...editorialState,
      group: 'core'
    },
    {
      ...accessState,
      group: 'core'
    },
    {
      ...preferredIdentifier,
      group: 'core'
    },
    {
      ...label,
      group: 'core'
    },
    {
      ...homepage,
      group: 'core'
    },
    {
      name: 'hasType',
      type: 'array',
      title: 'Klassifisert som',
      fieldset: 'core',
      group: 'core',
      of: [
        {
          type: 'reference',
          to: [{ type: 'ObjectType' }],
        },
      ],
      validation: (Rule) => Rule.required(),
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
    {
      ...identifiedBy,
      fieldset: 'core',
      group: 'core',
    },
    {
      ...referredToBy,
      fieldset: 'core',
      group: 'core',
    },
    {
      name: 'activityStream',
      title: 'Aktivitetsstrøm',
      description: 'Hendelser og aktiviteter knyttet til dette objektet.',
      fieldset: 'core',
      group: 'core',
      type: 'array',
      of: [
        { type: 'BeginningOfExistence' },
        { type: 'Production' },
        { type: 'Transformation' },
        { type: 'reference', to: [{ type: 'Acquisition' }] },
        { type: 'Move' },
        { type: 'Activity' },
        { type: 'Destruction' },
      ],
      options: {
        semanticSanity: {
          '@container': '@list',
          '@type': '@id'
        }
      },
    },
    {
      ...subject,
      fieldset: 'core',
      group: 'core',
    },
    {
      ...subjectOf,
      fieldset: 'core',
      group: 'core',
    },
    {
      ...license,
      fieldset: 'core',
      group: 'core',
    },
    {
      ...image,
      fieldset: 'mainImage',
      group: 'images'
    },
    {
      name: `mainImageAnnotations`,
      type: `array`,
      fieldset: 'mainImage',
      group: 'images',
      of: [
        defineField({
          name: 'spot',
          type: 'object',
          fieldsets: [{ name: 'position', options: { columns: 2 } }],
          fields: [
            { name: 'details', type: 'text', rows: 2 },
            depictsFunctional,
            {
              name: 'x',
              type: 'number',
              readOnly: true,
              fieldset: 'position',
              initialValue: 50,
              validation: (Rule) => Rule.required().min(0).max(100),
            },
            {
              name: 'y',
              type: 'number',
              readOnly: true,
              fieldset: 'position',
              initialValue: 50,
              validation: (Rule) => Rule.required().min(0).max(100),
            },
          ],
          preview: {
            select: {
              title: 'details',
              x: 'x',
              y: 'y',
            },
            prepare({ title, x, y }) {
              return {
                title,
                subtitle: x && y ? `${x}% x ${y}%` : `No position set`,
              }
            },
          },
        })
      ],
      options: {
        // plugin adds support for this option
        imageHotspot: {
          // see `Image and description path` setup below
          imagePath: `image`,
          descriptionPath: `label`,
          // see `Custom tooltip` setup below
          tooltip: undefined,
        }
      },
    },
    {
      ...digitallyShownBy,
      fieldset: 'representation',
      group: 'images',
    },
    {
      ...subjectOfManifest,
      fieldset: 'representation',
      group: 'images',
    },
    {
      ...file,
      fieldset: 'representation',
      group: 'images',
    },
    {
      ...relation,
      fieldset: 'relations',
      group: 'relations',
    },
    {
      ...presentAt,
      fieldset: 'relations',
      group: 'relations',
    },
    {
      ...depicts,
      fieldset: 'partsAndContent',
      group: 'partsAndContent',
    },
    {
      ...showsVisualObject,
      fieldset: 'partsAndContent',
      group: 'partsAndContent',
    },
    {
      ...carries,
      fieldset: 'partsAndContent',
      group: 'partsAndContent',
    },
    {
      ...composedOf,
      fieldset: 'partsAndContent',
      group: 'partsAndContent',
    },
    {
      ...measuredBy,
      fieldset: 'physicalDescription',
      group: 'physical',
    },
    {
      ...consistsOf,
      fieldset: 'physicalDescription',
      group: 'physical',
    },
    {
      ...hasCurrentOwner,
      fieldset: 'ownership',
      group: 'ownership',
    },
    {
      ...hasFormerOrCurrentOwner,
      fieldset: 'ownership',
      group: 'ownership',
    },
    wasOutputOf
  ],
  preview: {
    select: {
      title: 'label',
      id: 'preferredIdentifier',
      type: 'hasType.0.label',
      media: 'image',
      published: 'accessState',
    },
    prepare(selection) {
      const { title, id, type, media, published } = selection
      const secret = published === 'secret' ? '🔒' : ''

      return {
        title: coalesceLabel(title),
        subtitle: secret + (id ? `${id}, ` : '') + coalesceLabel(type),
        media: media,
      }
    },
  },
  orderings: [
    {
      title: 'Tittel, A-Å',
      name: 'label',
      by: [{ field: 'label', direction: 'asc' }],
    },
    {
      title: 'Tittel, Å-A',
      name: 'label',
      by: [{ field: 'label', direction: 'desc' }],
    },
    {
      title: 'Foretrukket id, Synkende',
      name: 'preferredIdentifier',
      by: [{ field: 'preferredIdentifier', direction: 'desc' }],
    },
    {
      title: 'Foretrukket id, Stigende',
      name: 'preferredIdentifier',
      by: [{ field: 'preferredIdentifier', direction: 'asc' }],
    },
  ],
})
