import { referredToBy, tookPlaceAt, featured, timespanSingleton, labelSingleton, joinedWith, joined, as } from '../props'

export const Joining = {
  name: 'Joining',
  type: 'document',
  title: 'Innlemmelse',
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
      validation: (Rule: any) => Rule.required(),
    },
    {
      ...joinedWith,
      validation: (Rule: any) => Rule.required(),
    },
    {
      ...joined,
      validation: (Rule: any) => Rule.required(),
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
    prepare(selection: any) {
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
