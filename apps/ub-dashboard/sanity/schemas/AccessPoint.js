import { labelSingleton, shortDescription } from "./props";

export const AccessPoint = {
  name: 'AccessPoint',
  title: 'Access point',
  type: 'document',
  liveEdit: true,
  /*   initialValue: {
      hasType: {
        _type: 'reference',
        _ref: '904829b8-5722-4776-948c-8841a9c5bdd5' // HTTP
      }
    }, */
  fields: [
    {
      name: 'value',
      title: 'Adresse',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      ...labelSingleton,
      validation: Rule => Rule
    },
    shortDescription,
  ],
  preview: {
    select: {
      title: 'label',
      url: 'value',
      type: 'hasType.label'
    },
    prepare(selection) {
      const { title, url, type } = selection

      return {
        title: `${title ?? url}`,
        subtitle: type,
      }
    },
  },
}