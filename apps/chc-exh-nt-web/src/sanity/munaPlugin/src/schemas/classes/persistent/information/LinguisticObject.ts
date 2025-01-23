import { defineType } from 'sanity'
import { defaultFieldsets } from '../../../../fieldsets/defaultFieldsets'
import { coalesceLabel } from '../../../../helpers/coalesceLabel'
import { accessState, editorialState } from '../../../properties/datatype'

export default defineType({
  name: 'LinguisticObject',
  type: 'object',
  title: 'Tekst',
  fieldsets: defaultFieldsets,
  groups: [
    {
      name: 'core',
      title: 'Tekst',
      default: true,
    },
    {
      name: 'metadata',
      title: 'Metadata',
    }
  ],
  initialValue: {
    editorialState: 'published',
    accessState: 'open',
  },
  fields: [
    {
      name: 'body',
      title: 'Tekst',
      group: 'core',
      type: 'blockContent',
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
    {
      name: 'hasType',
      title: 'Klassifisert som',
      group: 'core',
      type: 'reference',
      to: [{ type: 'TextType' }],
      validation: (Rule) => Rule.required(),
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
    {
      name: 'language',
      title: 'Språk',
      group: 'core',
      type: 'reference',
      to: [{ type: 'Language' }],
      validation: (Rule) => Rule.required(),
      options: {
        semanticSanity: {
          '@type': '@id'
        }
      },
    },
    {
      ...editorialState,
      group: 'core',
    },
    {
      ...accessState,
      group: 'core',
    },
    {
      name: 'creator',
      title: 'Skaper',
      group: 'metadata',
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
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
    {
      name: 'publishedAt',
      title: 'Publikasjonsdato',
      group: 'metadata',
      description: 'This can be used to schedule post for publishing',
      type: 'datetime',
    },
    {
      name: 'documentedIn',
      title: 'Dokumentert i',
      group: 'metadata',
      type: 'array',
      of: [{ type: 'file' }],
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
  ],
  preview: {
    select: {
      type: 'hasType.label',
      blocks: 'body',
      lang: 'language.label',
    },
    prepare(selection) {
      const { type, blocks, lang } = selection

      return {
        title: blocks?.length
          ? blocks[0].children
            .filter((child: any) => child._type === 'span')
            .map((span: any) => span.text)
            .join('')
          : 'No content',
        subtitle: [
          type ? coalesceLabel(type) + ' på' : '',
          lang ? coalesceLabel(lang) : ''
        ].filter(Boolean).join(' '),
      }
    },
  },
})
