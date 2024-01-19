import { tookPlaceAt, referredToBy, featured, timespanSingleton, labelSingleton, separatedFrom, separated } from '../props'
import { defaultFieldsets } from '../fieldsets'

export const Leaving = {
  name: 'Leaving',
  type: 'document',
  title: 'Utmeldelse',
  titleEN: 'Leaving',
  liveEdit: true,
  fieldsets: defaultFieldsets,
  fields: [
    labelSingleton,
    featured,
    {
      ...timespanSingleton,
      validation: Rule => Rule.required(),
    },
    {
      ...separated,
      validation: Rule => Rule.required(),
    },
    {
      ...separatedFrom,
      validation: Rule => Rule.required(),
    },
    {
      ...tookPlaceAt,
    },
    referredToBy,
  ],
  preview: {
    select: {
      label: 'label',
      actor: 'separated.0.label',
      group: 'separatedFrom.label',
      media: 'separated.0.logo',
      edtf: 'timespan.edtf'
    },
    prepare(selection) {
      const { label, actor, group, media, edtf } = selection
      const constructedTitle = `${actor ?? '???'} forlot ${group ?? '???'}`
      return {
        title: label ?? constructedTitle,
        subtitle: edtf,
        media: media
      }
    },
  },
}
