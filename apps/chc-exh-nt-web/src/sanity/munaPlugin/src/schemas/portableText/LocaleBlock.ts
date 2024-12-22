import { defineType } from 'sanity'

export default defineType({
  name: 'LocaleBlock',
  type: 'object',
  title: 'LocaleBlock',
  fieldsets: [
    {
      title: 'Translations',
      name: 'translations',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    {
      name: 'no',
      title: 'Norsk',
      type: 'string',
    }
  ],
  /* fields: supportedLanguages.map((lang) => ({
    title: lang.title,
    name: lang.id,
    type: 'blockContent',
    fieldset: lang.isDefault ? null : 'translations',
  })), */
  preview: {
    select: {
      blocks: 'nor',
    },
    prepare(selection) {
      const { blocks } = selection
      const desc = (blocks || []).find((block: any) => block._type === 'block')

      return {
        title: desc
          ? desc.children
            .filter((child: any) => child._type === 'span')
            .map((span: any) => span.text)
            .join('')
          : 'No description',
      }
    },
  },
})
