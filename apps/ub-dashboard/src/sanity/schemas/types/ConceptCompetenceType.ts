import { labelSingleton, referredToBy, shortDescription } from "../props";
import { isUniqueLabel } from '@/sanity/lib/utils';

export const CompetenceType = {
  name: 'CompetenceType',
  title: 'Competence type',
  type: 'document',
  liveEdit: true,
  fields: [
    {
      ...labelSingleton,
      description: 'Kan ikke være programmeringsspråk, programware, eller format allerede registrert!',
      validation: (Rule: any) =>
        Rule.required().custom(isUniqueLabel),
    },
    shortDescription,
    referredToBy
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'shortDescription',
    },
    prepare(selection: any) {
      const { title, subtitle } = selection
      return {
        title: `${title ?? ''}`,
        subtitle: subtitle
      }
    },
  },
}