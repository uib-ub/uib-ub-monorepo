import { hasType, labelSingleton, referredToBy, servesDataset, shortDescription, timespanSingleton, url } from "./props";

export const Endpoint = {
  name: 'Endpoint',
  title: 'Endpoint (IKKE bruk)',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    url,
    hasType,
    servesDataset,
    timespanSingleton,
    referredToBy
  ],
  preview: {
    select: {
      title: 'label',
      url: 'url',
    },
    prepare(selection) {
      const { title, url } = selection

      return {
        title: title,
        subtitle: url,
      }
    },
  },
}