import { labelSingleton, referredToBy, shortDescription } from "../props";

export const ProtocolType = {
  name: 'ProtocolType',
  title: 'Protocol type',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}