import { continued, continuedBy, hasFile, hasMember, hasType, identifiedBy, labelSingleton, logo, referredToBy, shortDescription, subGroupOf, timespanSingleton } from "./props";
import { client } from '../lib/client'

export const Group = {
  name: 'Group',
  title: 'Group',
  type: 'document',
  liveEdit: true,
  fields: [
    {
      ...labelSingleton,
      validation: (Rule) =>
        Rule.required().custom(async (param) => {
          const docs = await client.fetch(
            `*[label == "${param}" && _type == "Group" && !(_id in path("drafts.**"))] { label }`,
            { param },
          )
          return docs.length > 1 ? 'Value is not unique' : true
        }),
    },
    {
      ...hasType,
      of: [
        {
          type: 'reference',
          to: [{ type: 'GroupType' }],
        },
      ],
      validation: (Rule) => Rule.required(),
    },
    shortDescription,
    identifiedBy,
    timespanSingleton,
    referredToBy,
    subGroupOf,
    {
      ...hasMember,
      description: 'Hovedmedlemskap. Dvs. direktøren på UBB-nivå, seksjonsledere og medlemmer i seksjonene.',
      type: 'array',
      of: [{ type: 'ContributionAssignment' }],
    },
    {
      name: 'activityStream',
      title: 'Aktivitetsstrøm',
      titleEN: 'Activity stream',
      description:
        'En aktivitetsstrøm samler alle hendelser knyttet til denne aktøren. Fødsel og død er "inline" til personen, mens andre aktiviteter som ekteskap er egne dokument.',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'Activity' },
            { type: 'Event' },
            { type: 'Formation' },
            { type: 'Joining' },
            { type: 'Leaving' },
            { type: 'Dissolution' },
          ]
        },
      ],
      options: {
        modal: 'fullscreen',
        semanticSanity: {
          '@container': '@list',
          '@type': '@id'
        }
      },
    },
    {
      ...continued,
    },
    {
      ...continuedBy,
    },
    logo,
    {
      ...hasFile,
    }
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'hasType.0.label',
      period: 'timespan.edtf',
      media: 'logo',
    },
    prepare({ title, subtitle, period, media }) {
      return {
        title: `${title}`,
        subtitle: `${subtitle ?? ''} ${period ?? ''}`,
        media: media
      };
    },
  },
}