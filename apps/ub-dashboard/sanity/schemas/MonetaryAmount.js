export const MonetaryAmount = {
  name: 'MonetaryAmount',
  type: 'object',
  liveEdit: true,
  title: 'Beløp',
  titleEN: 'Monetary amount',
  fields: [
    {
      name: 'value',
      title: 'Verdi',
      titleEN: 'Value',
      type: 'number',
      validation: (Rule) => Rule.required(),
      options: {
        semanticSanity: {
          "@type": "xsd:number"
        }
      },
    },
    {
      name: 'hasCurrency',
      title: 'valuta',
      titleEN: 'has currency',
      type: 'reference',
      to: [{ type: 'Currency' }],
      validation: (Rule) => Rule.required(),
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
    prepare(selection) {
      const { value, currency } = selection
      return {
        title: `${value} ${currency}`,
      }
    },
  },
}