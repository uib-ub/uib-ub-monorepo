import { referredToBy, motivatedBy, featured, labelSingleton, formed, formedFrom, timespanSingleton } from '../props'
import { defaultFieldsets } from '../fieldsets'
import { coalesceLabel } from '../helpers'
import { FaMoneyCheck } from 'react-icons/fa'

var capitalize = require('capitalize')

export const FundingActivity = {
  name: 'FundingActivity',
  type: 'document',
  title: 'Finansiering',
  titleEN: 'FundingActivity',
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
    prepare(selection) {
      const { label, type, edtf, amount, currency } = selection
      return {
        title: `${label ?? capitalize(type)}`,
        subtitle: `${amount ?? ''} ${currency ?? ''} - ${edtf ?? ''}`,
      }
    },
  },
}
