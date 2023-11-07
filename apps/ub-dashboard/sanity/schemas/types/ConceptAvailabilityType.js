import { labelSingleton, referredToBy, shortDescription } from "../props";

export const AvailabilityType = {
  name: 'AvailabilityType',
  title: 'Availability type',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}