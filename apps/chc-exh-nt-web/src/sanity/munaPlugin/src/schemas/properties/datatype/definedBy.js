import { defineField } from 'sanity'

export const definedBy = defineField({
  name: 'definedBy',
  title: 'Koordinater',
  type: 'geopoint',
  options: {
    semanticSanity: {
      '@id': 'crm:defined_by',
    }
  },
})
