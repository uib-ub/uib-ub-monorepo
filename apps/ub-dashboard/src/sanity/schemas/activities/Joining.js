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
    timespanSingleton,
    joinedWith,
    joined,
    as,
    tookPlaceAt,
    referredToBy,
  ],
  preview: {
    select: {
      label: 'label',
      media: 'joined.0.image',
      edtf: 'timespan.edtf',
      role: 'as.label'
    },
    prepare(selection) {
      const { label, media, edtf, role } = selection
      return {
        title: label,
        subtitle: `${role ?? ''} ${edtf ?? ''}`,
        media: media
      }
    },
  },
}
