import { defineType } from 'sanity'

export default defineType({
  name: 'LocalizedSlug',
  type: 'object',
  title: 'Localized slug',
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
    }
  ]
})
