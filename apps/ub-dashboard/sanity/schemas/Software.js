import { hasType, logo, labelSingleton, link, programmedWith, referredToBy, shortDescription, uses } from "./props";

export const Software = {
  name: 'Software',
  title: 'Software',
  type: 'document',
  liveEdit: true,
  validation: Rule => Rule.custom(fields => {
    // Count ContrubutionAssignment timespans without a timespan.endOfTheEnd
    const activeSystemOwner = fields.currentOrFormerSystemOwner?.reduce((a, v) => (!v.timespan?.endOfTheEnd ? a + 1 : a), 0)
    const activeManager = fields.currentOrFormerManager?.reduce((a, v) => (!v.timespan?.endOfTheEnd ? a + 1 : a), 0)

    // Only 1 active system owner or manager is allowed
    if ((activeSystemOwner && activeSystemOwner !== 1) || (activeManager && activeManager !== 1)) return (
      `Det kan bare være
       ${(activeSystemOwner && activeSystemOwner !== 1) ? 'én aktiv systemeier' : ''} 
       ${(activeSystemOwner && activeSystemOwner !== 1) && (activeManager && activeManager !== 1) ? ' og ' : ''} 
       ${(activeManager && activeManager !== 1) ? 'én aktiv produkteier ' : ''} 
       (registrer en sluttdato i EDTF-feltet).`
    )
    return true
  }),
  fieldsets: [
    {
      name: 'core',
      title: 'Kjernemetadata',
      options: {
        collapsible: true,
        collapsed: false,
      }
    },
    {
      name: 'accountability',
      title: 'Ansvarlige',
      options: {
        columns: 2
      },
      hidden: ({ document }) => document?.externalSoftware === true,
    },
    {
      name: 'team',
      title: 'Team',
      hidden: ({ document }) => document?.externalSoftware === true,
    },
    {
      name: 'parts',
      title: 'Komponenter',
      hidden: ({ document }) => document?.externalSoftware === true,
    },
    {
      name: 'compute',
      title: 'Kjører på',
    },
    {
      name: 'extra',
      title: 'Ekstra',
      options: {
        columns: 2
      },
    }
  ],
  groups: [
    {
      name: 'parts',
      title: 'Komponenter',
    },
  ],
  fields: [
    {
      name: 'externalSoftware',
      title: 'Er dette ekstern software?',
      type: 'boolean',
    },
    {
      ...labelSingleton,
    },
    {
      ...shortDescription,
    },
    {
      ...referredToBy,
      fieldset: 'core',
    },
    {
      ...hasType,
      fieldset: 'core',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'SoftwareType' }] }
      ]
    },
    {
      name: 'websiteUrl',
      title: 'Nettside',
      fieldset: 'core',
      type: 'url',
    },
    {
      name: 'currentOrFormerSystemOwner',
      title: 'Systemeier',
      description: 'System eier er alltid en direktøren, så vi registrer institusjon eller avdeling her.',
      fieldset: 'accountability',
      type: 'array',
      of: [{ type: 'ContributionAssignment' }]
    },
    {
      name: 'currentOrFormerManager',
      title: 'Produkteier',
      description: 'Hvem er ansvarlig for utviklingen og/eller driften av denne programvaren?',
      fieldset: 'accountability',
      type: 'array',
      of: [{ type: 'ContributionAssignment' }]
    },
    {
      name: 'currentOrFormerMaintainerTeam',
      title: 'Eies av team',
      fieldset: 'team',
      type: 'array',
      of: [{ type: 'ContributionAssignment' }]
    },
    {
      name: 'hasSoftwarePart',
      title: 'Has part',
      fieldset: 'parts',
      group: 'parts',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'VolatileSoftware' }] }],
    },
    {
      name: 'runBy',
      title: 'Deployed by',
      fieldset: 'compute',
      group: 'parts',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'SoftwareComputingEService' }] }]
    },
    {
      ...programmedWith,
      fieldset: 'extra',
      description: 'Only use if necessary, prefer to register on source code.'
    },
    {
      ...uses,
      fieldset: 'extra',
    },
    link,
    logo,
  ],
  preview: {
    select: {
      title: 'label',
      external: 'externalSoftware',
      media: 'logo',
    },
    prepare({ title, external, media }) {
      return {
        title: `🖥️ ${title}`,
        subtitle: `${external === true ? 'Ekstern programvare. ' : ''}`,
        media: media
      };
    },
  },
}