import { defineType } from 'sanity';

export default defineType({
  name: 'Page',
  type: 'document',
  title: 'Side',
  fields: [
    {
      name: 'label',
      title: 'Tittel',
      type: 'string',
    },
    {
      // should match 'languageField' plugin configuration setting, if customized
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    },
    {
      name: 'content',
      title: 'Sideseksjoner',
      description: 'Legg til, rediger og endre rekkefølgen',
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
  preview: {
    select: {
      title: 'label',
      lang: 'language',
    },
    prepare(selection) {
      const { title, lang } = selection

      return {
        title: `${lang} | ${title}`,
      }
    },
  },
})
