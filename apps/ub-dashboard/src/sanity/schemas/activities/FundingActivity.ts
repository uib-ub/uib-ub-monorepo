import { referredToBy, motivatedBy, featured, labelSingleton, timespanSingleton } from '../props'
import { defaultFieldsets } from '../fieldsets'
import { FaMoneyCheck } from 'react-icons/fa'

export const FundingActivity = {
  name: 'FundingActivity',
  type: 'document',
  title: 'Finansiering',
  liveEdit: true,
  icon: FaMoneyCheck,
  fieldsets: defaultFieldsets,
  fields: [
    labelSingleton,
    featured,
    referredToBy,
    timespanSingleton,
    {
      name: 'awarder',
      title: 'Utdeler',
      type: 'reference',
      to: [{ type: 'Group' }]
    },
    {
      name: 'awardee',
      title: 'Mottaker',
      type: 'reference',
      to: [
        { type: 'Group' },
        { type: 'Project' }
      ]
    },
    {
      name: 'fundingAmount',
      title: 'Beløp',
      type: 'MonetaryAmount',
    },
    motivatedBy,
  ],
  preview: {
    select: {
      label: 'label',
      type: '_type',
      edtf: 'timespan.edtf',
      amount: 'fundingAmount.value',
      currency: 'fundingAmount.hasCurrency.label',
    },
    prepare(selection: any) {
      const { label, type, edtf, amount, currency } = selection
      return {
        title: `${label ?? type}`,
        subtitle: `${amount ?? ''} ${currency ?? ''} - ${edtf ?? ''}`,
      }
    },
  },
}
