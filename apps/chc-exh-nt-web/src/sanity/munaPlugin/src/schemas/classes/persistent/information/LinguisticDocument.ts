
// import jsonata from 'jsonata'
import { FaMarker } from 'react-icons/fa';
import { defineType } from 'sanity';
import { defaultFieldsets } from '../../../../fieldsets/defaultFieldsets';
import { accessState, editorialState, labelSingleton } from '../../../properties/datatype';
import { about, identifiedBy, image } from '../../../properties/object';

export default defineType({
  name: 'LinguisticDocument',
  type: 'document',
  title: 'Text',
  initialValue: {
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
    {
      // should match 'languageField' plugin configuration setting, if customized
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    },
    {
      name: 'hasType',
      title: 'Klassifisert som',
      group: 'content',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'TextType' }],
        },
      ],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'categories',
      title: 'Kategorier',
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
      lang: 'language',
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
