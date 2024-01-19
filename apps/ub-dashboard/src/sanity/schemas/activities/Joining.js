import { referredToBy, tookPlaceAt, featured, timespanSingleton, labelSingleton, joinedWith, joined, as } from '../props'

export const Joining = {
  name: 'Joining',
  type: 'document',
  title: 'Innlemmelse',
  titleEN: 'Joining',
  liveEdit: true,
  fieldsets: [
    {
      name: 'minimum',
      title: 'Minimumsregistrering',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    labelSingleton,
    featured,
    {
      ...timespanSingleton,
      validation: Rule => Rule.required(),
    },
    {
      ...joinedWith,
      validation: Rule => Rule.required(),
    },
    {
      ...joined,
      validation: Rule => Rule.required(),
    },
    as,
    tookPlaceAt,
    referredToBy,
  ],
  preview: {
    select: {
      label: 'label',
      actor: 'joined.0.label',
      group: 'joinedWith.label',
      media: 'joined.0.image',
      edtf: 'timespan.edtf',
      role: 'as.label'
    },
    prepare(selection) {
      const { label, actor, group, media, edtf, role } = selection
      const constructedTitle = `${actor ?? '???'} startet i ${group ?? '???'}`
      return {
        title: label ?? constructedTitle,
        subtitle: `${role ?? ''} ${edtf ?? ''}`,
        media: media
      }
    },
  },
}
