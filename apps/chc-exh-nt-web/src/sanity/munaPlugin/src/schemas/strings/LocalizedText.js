import { defineType } from 'sanity';

const i18nConfig = {
  base: "no",
  languages: [
    {
      "id": "no",
      "title": "Bokmål"
    },
    {
      "id": "en",
      "title": "English"
    },
    {
      "id": "ar",
      "title": "Arabic"
    },
  ]
}

export default defineType({
  name: 'LocalizedText',
  type: 'object',
  title: 'Localized text',
  fieldsets: [
    {
      title: 'Translations',
      name: 'translations',
      options: {
        collapsible: true,
        collapsed: false,
      },
    },
  ],
  fields: i18nConfig.languages.map((lang) => ({
    title: lang.title,
    name: lang.id,
    type: 'text',
    fieldset: lang.id === i18nConfig.base ? undefined : 'translations',
  })),
})
