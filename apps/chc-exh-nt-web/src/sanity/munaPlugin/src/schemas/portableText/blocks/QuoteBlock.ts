import { defineType } from 'sanity'
import { QuotePreview } from '../../../previews/QuotePreview'

export default defineType({
  name: 'QuoteBlock',
  type: 'object',
  title: 'Quote',
  components: {
    preview: QuotePreview
  },
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    {
      name: 'content',
      type: 'simpleBlockContent',
    },
    {
      name: 'credit',
      type: 'simpleBlockContent',
    },
  ],
  preview: {
    select: {
      content: 'content',
      credit: 'credit',
      disabled: 'disabled',
    },
    prepare({ content, credit }) {
      return {
        title: content ?? '',
        subtitle: credit ?? '',
        media: null
      }
    },
  },
})
