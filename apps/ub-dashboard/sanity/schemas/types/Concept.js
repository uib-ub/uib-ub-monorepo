import { labelSingleton, referredToBy, shortDescription } from "../props";

export const Concept = {
  name: 'Concept',
  title: 'Concept',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}