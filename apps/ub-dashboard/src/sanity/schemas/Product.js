import { hasFile, hadParticipant, image, labelSingleton, link, referredToBy, usedService, shortDescription, timespanSingleton, composedOfProducts, logo } from "./props";

export const Product = {
  name: 'Product',
  title: 'Produkt  (IKKE BRUK)',
  type: 'document',
  liveEdit: true,
  fields: [
    labelSingleton,
    shortDescription,
    referredToBy,
    timespanSingleton,
    link,
    usedService,
    hadParticipant,
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
            { type: 'BeginningOfExistence' },
            { type: 'Activity' },
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
    logo,
    image,
    hasFile
  ],
  preview: {
    select: {
      title: 'label',
      edtf: 'timespan.edtf',
      media: 'logo,'
    },
    prepare(selection) {
      const { title, edtf, media } = selection

      return {
        title: title,
        subtitle: edtf,
        media: media,
      }
    },
  },
}