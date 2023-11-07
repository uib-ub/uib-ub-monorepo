import { labelSingleton } from "../props";

export const DigitalObjectFile = {
  name: 'DigitalObject.File',
  title: 'File',
  type: 'object',
  fields: [
    labelSingleton,
    {
      name: 'souce',
      title: 'Kilde',
      titleEN: 'Source',
      type: 'url',
    },
    {
      name: 'accessPoint',
      title: 'Fil',
      type: 'file',
    },
  ],
  preview: {
    select: {
      title: 'label',
    },
  },
}