import { continued, continuedBy, hasFile, hasMember, hasType, identifiedBy, labelSingleton, logo, referredToBy, shortDescription, subGroupOf, timespanSingleton } from "./props";

export const Group = {
  name: 'Group',
  title: 'Group',
  type: 'document',
  liveEdit: true,
  fields: [
    {
      ...labelSingleton,
    },
    {
      ...hasType,
      of: [
        {
          type: 'reference',
          to: [{ type: 'GroupType' }],
        },
      ],
      validation: (Rule: any) => Rule.required(),
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
    prepare(selection: any) {
      const { title, subtitle, period, media } = selection
      return {
        title: title,
        subtitle: `${subtitle ?? ''} ${period ?? ''}`.trim(),
        media: media
      };
    },
  },
}