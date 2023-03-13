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
      titleEN: 'Description',
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
      titleEN: 'Source',
      type: 'url',
    },
  ],
})
