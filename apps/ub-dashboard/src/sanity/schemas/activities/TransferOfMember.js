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
    timespanSingleton,
    transferred,
    transferredFrom,
    transferredTo,
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
      return {
        title: `${transferred ? transferred + ' ' : ''}overført fra ${transferredFrom ? transferredFrom : ''} til ${transferredTo ? transferredTo : ''}`,
        subtitle: `${role} ${edtf}`,
      }
    },
  },
}
