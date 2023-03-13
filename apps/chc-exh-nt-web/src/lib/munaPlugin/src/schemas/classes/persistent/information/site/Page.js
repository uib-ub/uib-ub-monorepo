import { defineType } from 'sanity';

const baseLang = process.env.NEXT_PUBLIC_BASE_LANGUAGE

export default defineType({
  name: 'Page',
  type: 'document',
  title: 'Side',
  i18n: true,
  initialValue: {
    '__i18n_lang': baseLang,
    '__i18n_refs': [],
  },
  fields: [
    {
      name: 'label',
      title: 'Tittel',
      titleEN: 'Title',
      type: 'string',
    },
    {
      name: 'content',
      title: 'Sideseksjoner',
      titleEN: 'Page sections',
      description: 'Legg til, rediger og endre rekkefølgen',
      descriptionEN: 'Add, edit, and reorder sections',
      type: 'array',
      of: [
        { type: 'HeroBlock' },
        { type: 'reference', to: [{ type: 'Route' }] },
        { type: 'TextBlock' },
        { type: 'PublicationBlock' },
        { type: 'QuoteBlock' },
        { type: 'ObjectBlock' },
        { type: 'EventBlock' },
        { type: 'TableBlock' },
        { type: 'TwoColumnBlock' },
        { type: 'GridBlock' },
        { type: 'VideoBlock' },
        { type: 'IframeBlock' },
      ],
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
  ],
})
