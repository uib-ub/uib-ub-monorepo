import { labelSingleton, referredToBy, shortDescription } from "../props";

export const ConditionOfUseType = {
  name: 'ConditionOfUseType',
  title: 'Condition of use type',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}