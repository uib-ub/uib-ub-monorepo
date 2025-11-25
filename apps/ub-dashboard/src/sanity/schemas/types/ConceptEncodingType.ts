import { labelSingleton, referredToBy, shortDescription } from "../props";

export const EncodingType = {
  name: 'EncodingType',
  title: 'Encoding type',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}