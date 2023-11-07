/* 
  Subclass of D1 Digital Object
*/

export const DigitalObjectImage = {
  name: 'DigitalObject.Image',
  type: 'image',
  title: 'Image',
  options: {
    hotspot: true,
    metadata: ['exif', 'location', 'lqip', 'palette'],
    semanticSanity: {
      exclude: true
    }
  },
  fields: [
    {
      name: 'caption',
      title: 'Bildetekst',
      type: 'LocaleString',
    },
    {
      name: 'alt',
      title: 'Alternative tekst',
      description: 'Important for SEO and accessiblity.',
      type: 'LocaleString',
      validation: (Rule) => Rule.warning('You should to fill out the alternative text.'),
    }
  ],
}
