import { defineType } from 'sanity'
import { label } from "../../properties/datatype"

export default defineType({
  name: 'ObjectCompareBlock',
  type: 'object',
  title: 'Compare images',
  fields: [
    label,
    {
      name: 'caption',
      title: 'Bildetekst',
      type: 'LocalizedString',
    },
    {
      name: 'before',
      title: 'Before',
      type: 'array',
      of: [
        {
          type: 'DigitalObjectImage'
        },
        {
          type: 'reference',
          to: [{
            type: 'HumanMadeObject'
          }
          ]
        }
      ],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'after',
      title: 'After',
      type: 'array',
      of: [{
        type: 'DigitalObjectImage'
      },
      {
        type: 'reference',
        to: [{
          type: 'HumanMadeObject'
        }
        ]
      }],
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'label',
    },
    prepare(selection) {
      const { title } = selection
      return {
        title: title,
      }
    },
  },
})
