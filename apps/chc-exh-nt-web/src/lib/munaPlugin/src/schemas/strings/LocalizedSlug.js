import { defineType } from 'sanity'

export default defineType({
  name: 'LocalizedSlug',
  type: 'object',
  title: 'Localized slug',
  options: {
    semanticSanity: {
      exclude: true
    }
  },
  fieldsets: [
    {
      title: 'Translations',
      name: 'translations',
      options: { collapsible: true },
    },
  ],
  fields: [
    {
      name: 'no',
      title: 'Norsk',
      type: 'string',
      isDefault: true,
    }
  ]
})
