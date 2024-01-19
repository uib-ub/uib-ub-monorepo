import { defineField } from 'sanity';
import { imageSingleton, labelSingleton, referredToBy, shortDescription, timespan } from "./props";
import CreateNewRefInput from '../components/create-new-ref-input';

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
    // TEST: add ref to Actor when creating new Joining document
    defineField({
      type: 'reference',
      name: 'reference',
      title: 'Alternativ aktivitetsstrøm',
      description: 'Hendelse og aktiviteter som henviser til denne personen.',
      to: [
        { type: 'Joining' },
        { type: 'TransferOfMember' },
        { type: 'Leaving' },
        { type: 'Activity' },
        { type: 'Birth' },
        { type: 'Death' },
      ],
      components: {
        input: CreateNewRefInput,
      },
      options: {
        disableNew: true,
      },
    }),
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
            { type: 'Joining' },
            { type: 'TransferOfMember' },
            { type: 'Leaving' },
            { type: 'Activity' },
            { type: 'Birth' },
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