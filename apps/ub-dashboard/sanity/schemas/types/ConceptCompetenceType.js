import { labelSingleton, referredToBy, shortDescription } from "../props";
import { client } from '../../lib/client'

export const CompetenceType = {
  name: 'CompetenceType',
  title: 'Competence type',
  type: 'document',
  liveEdit: true,
  fields: [
    {
      ...labelSingleton,
      description: 'Kan ikke være programmeringsspråk, programware, eller format allerede registrert!',
      validation: (Rule) =>
        Rule.required().custom(async (param) => {
          const docs = await client.fetch(
            `*[label == "${param}" && _type in ["ProgrammingLanguage", "EncodingType", "Software", "VolatileSoftware"] && !(_id in path("drafts.**"))] { label }`,
            { param },
          )
          return docs.length > 1 ? 'Kan ikke være programmeringsspråk, programware, eller format allerede registrert!' : true
        }),
    },
    shortDescription,
    referredToBy
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'shortDescription',
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title: `${title ?? ''}`,
        subtitle: subtitle
      }
    },
  },
}