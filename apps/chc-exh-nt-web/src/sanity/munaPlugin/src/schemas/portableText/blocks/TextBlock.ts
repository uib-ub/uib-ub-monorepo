import { defineType } from 'sanity'
import { TextPreview } from "../../../previews/TextPreview"

export default defineType({
  name: 'TextBlock',
  title: 'Text',
  type: 'object',
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
      name: 'label',
      title: 'Tittel',
      type: 'string',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'simpleBlockContent',
    },
  ],
  preview: {
    select: {
      title: 'label',
      content: 'content',
      disabled: 'disabled',
    },
    prepare({ title, content }) {
      return {
        title: title ?? '',
        content: content ?? '',
        type: 'Text'
      }
    },
  },
})
