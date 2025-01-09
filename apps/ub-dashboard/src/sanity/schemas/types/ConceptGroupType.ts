import { labelSingleton, referredToBy, shortDescription } from "../props";

export const GroupType = {
  name: 'GroupType',
  title: 'Group type',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}