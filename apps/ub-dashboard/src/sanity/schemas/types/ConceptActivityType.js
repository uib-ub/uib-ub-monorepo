import { labelSingleton, referredToBy, shortDescription } from "../props";

export const ActivityType = {
  name: 'ActivityType',
  title: 'Activity type',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}