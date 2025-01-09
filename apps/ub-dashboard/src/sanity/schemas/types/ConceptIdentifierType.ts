import { labelSingleton, referredToBy, shortDescription } from "../props";

export const IdentifierType = {
  name: 'IdentifierType',
  title: 'Identifier type',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}