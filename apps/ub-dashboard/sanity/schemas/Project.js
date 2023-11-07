import { continued, continuedBy, hasFile, hadParticipant, logo, labelSingleton, link, referredToBy, resultedIn, shortDescription, timespanSingleton, carriedOutBy, hasTeam, identifiedBy, hasType, motivatedBy, image } from "./props";

export const Project = {
  name: 'Project',
  title: 'Prosjekt',
  type: 'document',
  liveEdit: true,
  groups: [
    {
      name: 'core',
      title: 'Kjerne'
    },
    {
      name: 'actors',
      title: 'Aktører',
    },
    {
      name: 'timeline',
      title: 'Tidslinje',
    },
    {
      name: 'resources',
      title: 'Ressurser',
    }
  ],
  fields: [
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Konseptfase', value: 'planning' },
          { title: 'Pågående', value: 'ongoing' },
          { title: 'Avsluttet', value: 'completed' },
          { title: 'Avslått', value: 'rejected' },
          { title: 'Forlatt', value: 'abandoned' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: Rule => Rule.required()
    },
    {
      ...hasType,
      of: [{ type: 'reference', to: [{ type: 'ProjectType' }] }],
      validation: Rule => Rule
    },
    labelSingleton,
    shortDescription,
    identifiedBy,
    referredToBy,
    timespanSingleton,
    {
      ...hasTeam,
      group: 'actors',
    },
    {
      ...carriedOutBy,
      description: 'Hvilken institusjon var prosjekteier?',
      group: 'actors',
    },
    {
      ...hadParticipant,
      description: 'Hvilke institusjoner var partnere?',
      group: 'actors',
    },
    {
      ...resultedIn,
      group: 'timeline',
    },
    {
      ...continuedBy,
      group: 'timeline',
    },
    {
      ...motivatedBy,
      of: [
        {
          type: 'reference',
          to: [
            { type: 'Project' }
          ],
        },
      ],
      group: 'timeline',
    },
    {
      name: 'activityStream',
      title: 'Aktivitetsstrøm',
      titleEN: 'Activity stream',
      description:
        'En aktivitetsstrøm samler alle hendelser knyttet til denne aktøren. Fødsel og død er "inline" til personen, mens andre aktiviteter som ekteskap er egne dokument.',
      descriptionEN: 'Add all known events this smuck did',
      group: 'timeline',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'BeginningOfExistence' },
            { type: 'Activity' },
            { type: 'FundingActivity' },
            { type: 'Event' },
            { type: 'Joining' },
            { type: 'Leaving' },
            { type: 'EndOfExistence' },
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
      group: 'timeline',
    },
    {
      ...link,
      group: 'resources'
    },
    {
      ...logo,
      group: 'resources'
    },
    {
      ...image,
      group: 'resources'
    },
    {
      ...hasFile,
      group: 'resources'
    }
  ],
  preview: {
    select: {
      title: 'label',
      media: "logo",
      edtf: 'timespan.edtf',
    },
    prepare(selection) {
      const { title, media, edtf } = selection

      return {
        title: title,
        subtitle: edtf,
        media: media
      }
    },
  },
}