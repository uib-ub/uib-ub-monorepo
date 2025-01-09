import { defineType } from 'sanity'

export default defineType({
  name: 'Post',
  type: 'document',
  title: 'Blogg innlegg',
  fields: [
    {
      name: 'label',
      title: 'Tittel',
      description: 'Titles should be catchy, descriptive, and not too long',
      type: 'string',
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      description: 'En "slug" bruks i sidens nettadresse. Basert på tittel',
      options: {
        source: 'label',
        maxLength: 96,
      },
    },
    {
      name: 'publishedAt',
      title: 'Publikasjonsdato',
      description: 'Denne datoen kan settes frem i tid for fremtidig publisering på en nettside',
      type: 'datetime',
      options: {
        semanticSanity: {
          "@type": "xsd:dateTime"
        }
      },
    },
    {
      name: 'excerpt',
      type: 'simpleBlockContent',
      title: 'Sammendrag',
      description: 'Brukes på oversiktssider, på Google og på sosiale medier.',
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
    {
      name: 'image',
      title: 'Hovedbilde',
      type: 'DigitalObjectImage',
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
    {
      name: 'body',
      title: 'Tekst',
      type: 'blockContent',
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
    {
      name: 'authors',
      title: 'Authors',
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
      name: 'categories',
      title: 'Kategorier',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: {
            type: 'Concept',
          },
        },
      ],
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
  ],
  orderings: [
    {
      name: 'publishingDateAsc',
      title: 'Publishing date new–>old',
      by: [
        {
          field: 'publishedAt',
          direction: 'asc',
        },
        {
          field: 'label',
          direction: 'asc',
        },
      ],
    },
    {
      name: 'publishingDateDesc',
      title: 'Publishing date old->new',
      by: [
        {
          field: 'publishedAt',
          direction: 'desc',
        },
        {
          field: 'label',
          direction: 'asc',
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'label',
      publishedAt: 'publishedAt',
      slug: 'slug',
      media: 'image',
    },
    prepare({ title = 'No title', publishedAt, slug = {}, media }) {
      const path = `/blog/${slug.current}`
      return {
        title,
        media,
        subtitle: publishedAt ? path : 'Uten publiseringsdato',
      }
    },
  },
})
