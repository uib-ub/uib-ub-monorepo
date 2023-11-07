import { labelSingleton, shortDescription } from '../props'
import { defaultFieldsets } from '../fieldsets'

export const WebResource = {
  name: 'WebResource',
  title: 'Nettsider',
  type: 'object',
  fieldsets: defaultFieldsets,
  fields: [
    labelSingleton,
    {
      name: 'url',
      title: 'URL',
      type: 'url'
    },
    shortDescription,
  ],
  preview: {
    select: {
      title: 'label',
      url: 'url'
    },
    prepare(selection) {
      const { title, url } = selection

      return {
        title: title,
        subtitle: url
      }
    },
  },
}
