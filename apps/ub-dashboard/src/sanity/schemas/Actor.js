import { imageSingleton, labelSingleton, referredToBy, shortDescription, timespan } from "./props";

export const Actor = {
  name: 'Actor',
  title: 'Person',
  type: 'document',
  liveEdit: true,
  fields: [
    {
      ...labelSingleton,
    },
    shortDescription,
    {
      name: 'quote',
      title: 'Sitat',
      description: 'Kort, kort sitat med hermetegn!',
      type: 'string'
    },
    {
      ...timespan,
      title: 'Tid på Universitetsbiblioteket i Bergen'
    },
    referredToBy,
    {
      name: 'hasSkill',
      title: 'Kompetanse',
      type: 'array',
      of: [{ type: 'Skill' }]
    },
    {
      name: 'activityStream',
      title: 'Aktivitetsstrøm',
      titleEN: 'Activity stream',
      description:
        'En aktivitetsstrøm samler alle hendelser knyttet til denne aktøren. Fødsel og død er "inline" til personen, mens andre aktiviteter som ekteskap er egne dokument.',
      descriptionEN: 'Add all known events this smuck did',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'Birth' },
            { type: 'Activity' },
            { type: 'Event' },
            { type: 'Joining' },
            { type: 'TransferOfMember' },
            { type: 'Leaving' },
            { type: 'Death' },
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
    imageSingleton
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'shortDescription',
      timespan: 'timespan.edtf',
      media: 'image',
    },
    prepare(selection) {
      const { title, subtitle, timespan, media } = selection
      return {
        title: `${title ?? ''}`,
        subtitle: `${subtitle ? subtitle : ''} ${timespan ? `(${timespan})` : ''}`,
        media: media,
      }
    },
  },
}