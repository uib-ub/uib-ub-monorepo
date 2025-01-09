import { labelSingleton, referredToBy, shortDescription } from "../props";

export const NameType = {
  name: 'NameType',
  title: 'Name type',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}