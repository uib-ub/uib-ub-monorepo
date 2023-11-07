import { hasType, logo, labelSingleton, link, programmedWith, referredToBy, shortDescription, uses } from "./props";

export const Schema = {
  name: 'Schema',
  title: 'Software',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    {
      ...hasType,
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'SoftwareType' }] }
      ]
    },
    {
      name: 'maintainedBy',
      title: 'Eies av',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'Group' }] }]
    },
    {
      name: 'hasSoftwarePart',
      title: 'Has part',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'VolatileSoftware' }] }]
    },
    referredToBy,
    programmedWith,
    uses,
    link,
    logo,
  ],
  preview: {
    select: {
      title: 'label',
      owner: 'maintainedBy.0.label',
      media: 'logo',
    },
    prepare({ title, owner, media }) {
      return {
        title: `${title}`,
        subtitle: `${owner ?? ''}`,
        media: media
      };
    },
  },
}