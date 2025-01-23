export const MonetaryAmount = {
  name: 'MonetaryAmount',
  type: 'object',
  liveEdit: true,
  title: 'Beløp',
  fields: [
    {
      name: 'value',
      title: 'Verdi',
      type: 'number',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'hasCurrency',
      title: 'valuta',
      type: 'reference',
      to: [{ type: 'Currency' }],
      validation: (Rule: any) => Rule.required(),
      initialValue: {
        _ref: '4b48e656-d33a-49f6-bdb8-e66546c6aa0f'
      }
    },
  ],
  preview: {
    select: {
      value: 'value',
      currency: 'hasCurrency.label',
    },
    prepare(selection: any) {
      const { value, currency } = selection
      return {
        title: `${value} ${currency}`,
      }
    },
  },
}