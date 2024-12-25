import { labelSingleton } from "../../props"

export const SingleLevelChart = {
  name: 'SingleLevelChart',
  type: 'object',
  title: 'Singel level chart',
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    {
      name: 'type',
      title: 'Type diagram',
      options: {
        list: [
          { title: 'Pai', value: 'pie' }
        ]
      },
      initialValue: 'pie',
      type: 'string',
    },
    labelSingleton,
    {
      name: 'caption',
      title: 'Tekst',
      type: 'blockContent',
    },
    {
      name: 'data',
      title: 'Data',
      options: {
        language: 'json'
      },
      type: 'code',
    },
  ],
  preview: {
    select: {
      title: 'label',
      disabled: 'disabled',
    },
    prepare({ title, disabled }: any) {
      return {
        title: title ?? 'Unnamed chart',
        subtitle: disabled,
      }
    },
  },
}
