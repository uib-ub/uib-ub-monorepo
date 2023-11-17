import { defineField, defineType } from 'sanity';
import { labelSingleton, shortDescription } from "./props";
import { isUniqueValue } from '../lib/utils';

export const AccessPoint = defineType({
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
    defineField({
      name: 'value',
      title: 'Adresse',
      type: 'string',
      validation: Rule => Rule.required().custom(isUniqueValue)
    }),
    {
      ...labelSingleton,
      validation: false
    },
    shortDescription,
  ],
  orderings: [
    {
      title: 'URL, Å-A',
      name: 'valueDesc',
      by: [
        { field: 'value', direction: 'desc' }
      ]
    },
    {
      title: 'URL, A-Å',
      name: 'valueAsc',
      by: [
        { field: 'value', direction: 'asc' }
      ]
    },
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
})