import { labelSingleton, referredToBy, shortDescription } from "./props";

export const Language = {
  name: 'Language',
  title: 'Language (do not use)',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}