import { defineType } from 'sanity'
import { label, license } from '../../../properties/datatype'

export default defineType({
  name: 'DigitalObjectFile',
  type: 'file',
  title: 'Fil',
  fields: [
    label,
    {
      name: 'description',
      title: 'Beskrivelse',
      type: 'LocaleBlockSimple',
      options: {
        semanticSanity: {
          "@type": "@json"
        }
      },
    },
    license,
    {
      name: 'souce',
      title: 'Kilde',
      type: 'url',
    },
  ],
})
