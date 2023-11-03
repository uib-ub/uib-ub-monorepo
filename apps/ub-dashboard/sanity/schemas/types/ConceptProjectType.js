import { labelSingleton, referredToBy, shortDescription } from "../props";

export const ProjectType = {
  name: 'ProjectType',
  title: 'Project type',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy
  ]
}