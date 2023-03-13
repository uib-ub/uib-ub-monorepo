
// import jsonata from 'jsonata'
import { FaMarker } from 'react-icons/fa'
import { defineType } from 'sanity';
import { defaultFieldsets } from '../../../../fieldsets/defaultFieldsets'
import { accessState, editorialState, labelSingleton } from '../../../properties/datatype'
import { about, identifiedBy, image, language } from '../../../properties/object'

const baseLang = process.env.NEXT_PUBLIC_BASE_LANGUAGE

export default defineType({
  name: 'LinguisticDocument',
  type: 'document',
  title: 'Text',
  i18n: true,
  initialValue: {
    '__i18n_lang': baseLang,
    '__i18n_refs': [],
    editorialState: 'review',
    accessState: 'secret',
    hasType: [{
      _ref: 'ff60b82d-e943-4328-bac5-b68675cf3cce'
    }]
  },
  icon: FaMarker,
  fieldsets: defaultFieldsets,
  groups: [
    {
      name: 'content',
      title: 'Content',
      default: true
    },
    {
      name: 'core',
      title: 'Metadata',
    }
  ],
  fields: [
    editorialState,
    accessState,
    {
      ...labelSingleton,
      group: ['core', 'content']
    },
    identifiedBy,
    {
      name: 'slug',
      title: 'Slug',
      titleEN: 'Slug',
      description: 'Some frontends will require a slug to be set to be able to show the post',
      type: 'slug',
      options: {
        source: 'label',
        maxLength: 96,
      },
    },
    {
      name: 'creator',
      title: 'Skaper',
      titleEN: 'Author',
      description:
        'Registrer en eller flere aktører som har skapt dette dokumentet, gjerne med hvilken rolle de hadde.',
      group: 'core',
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
    language,
    {
      name: 'hasType',
      title: 'Klassifisert som',
      titleEN: 'Classified as',
      group: 'content',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'TextType' }],
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
      name: 'categories',
      title: 'Kategorier',
      titleEN: 'Categories',
      group: 'core',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'Concept' }],
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
      titleEN: 'Published at',
      description: 'This can be used to schedule post for publishing',
      group: 'core',
      type: 'datetime',
      options: {
        semanticSanity: {
          "@type": "xsd:dateTime"
        }
      },
    },
    {
      ...about,
      group: 'content',
    },
    {
      name: 'body',
      title: 'Tekst',
      titleEN: 'Body',
      group: 'content',
      type: 'blockContent',
      options: {
        semanticSanity: {
          "@type": "@json"
        }
      },
    },
    {
      name: 'excerpt',
      title: 'Sammendrag',
      titleEN: 'Excerpt',
      group: 'content',
      description:
        'This ends up on summary pages, on Google, when people share your post in social media.',
      type: 'text',
      options: {
        semanticSanity: {
          "@type": "@json"
        }
      },
      validation: Rule => Rule.max(160).warning('Shorter descriptions are better!')
    },
    {
      ...image,
      group: 'core'
    },
    {
      name: 'documentedIn',
      title: 'Documented in',
      titleEN: 'Dokumentert i',
      group: 'core',
      type: 'array',
      of: [{ type: 'file' }],
      options: {
        semanticSanity: {
          exclude: true
        }
      },
    },
  ],
  preview: {
    select: {
      title: 'label',
      media: 'mainImage',
      lang: '__i18n_lang',
    },
    prepare(selection) {
      const { title, media, lang } = selection

      return {
        title: `${lang} | ${title}`,
        media: media,
      }
    },
  },
})
