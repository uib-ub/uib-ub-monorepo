import { defineType } from 'sanity'
import { TextPreview } from '../../../previews/TextPreview'

export default defineType({
  name: 'BigTextBlock',
  type: 'object',
  title: 'Stor tekst',
  description: 'Stor tekst. Centered. Keep it short to max 2-3 paragraphs.',
  components: {
    preview: TextPreview
  },
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    {
      name: 'content',
      title: 'Tekst',
      type: 'blockContent',
    },
  ],
  preview: {
    select: {
      title: 'title',
      content: 'content',
      disabled: 'disabled',
    },
    prepare({ title, content }) {
      return {
        title: title ?? '',
        content: content ?? '',
        type: 'Big text'
      }
    },
  },
})
