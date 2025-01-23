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
      validation: (Rule: any) => Rule.required(),
    },
    {
      ...transferred,
      validation: (Rule: any) => Rule.required(),
    },
    {
      ...transferredFrom,
      validation: (Rule: any) => Rule.required(),
    },
    {
      ...transferredTo,
      validation: (Rule: any) => Rule.required(),
    },
    as,
    referredToBy,
  ],
  preview: {
    select: {
      label: 'label',
      transferred: 'transferred.label',
      transferredFrom: 'transferredFrom.label',
      transferredTo: 'transferredTo.label',
      role: 'as.label',
      edtf: 'timespan.edtf'
    },
    prepare(selection: any) {
      const { transferred, transferredFrom, transferredTo, role, edtf, label } = selection
      const constructedTitle = `${transferred ?? '???'} overført fra ${transferredFrom ?? '???'} til ${transferredTo ?? '???'}`
      return {
        title: constructedTitle ?? label,
        subtitle: `${role} ${edtf}`,
      }
    },
  },
}
