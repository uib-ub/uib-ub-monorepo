import { referredToBy, featured, timespanSingleton, labelSingleton, as, transferredFrom, transferredTo, transferred } from '../props'

export const TransferOfMember = {
  name: 'TransferOfMember',
  type: 'document',
  title: 'Overføring',
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
      ...transferred,
      validation: Rule => Rule.required(),
    },
    {
      ...transferredFrom,
      validation: Rule => Rule.required(),
    },
    {
      ...transferredTo,
      validation: Rule => Rule.required(),
    },
    as,
    referredToBy,
  ],
  preview: {
    select: {
      transferred: 'transferred.label',
      transferredFrom: 'transferredFrom.label',
      transferredTo: 'transferredTo.label',
      role: 'as.label',
      edtf: 'timespan.edtf'
    },
    prepare(selection) {
      const { transferred, transferredFrom, transferredTo, role, edtf } = selection
      const constructedTitle = `${transferred ?? '???'} overført fra ${transferredFrom ?? '???'} til ${transferredTo ?? '???'}`
      return {
        title: constructedTitle ?? label,
        subtitle: `${role} ${edtf}`,
      }
    },
  },
}
