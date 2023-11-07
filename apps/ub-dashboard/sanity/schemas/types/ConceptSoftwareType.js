import { labelSingleton, referredToBy, shortDescription } from "../props";

export const SoftwareType = {
  name: 'SoftwareType',
  title: 'Software type',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}