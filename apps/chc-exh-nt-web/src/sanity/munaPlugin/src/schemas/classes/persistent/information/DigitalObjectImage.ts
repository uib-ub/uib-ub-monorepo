import { defineType } from 'sanity';

/* 
  Subclass of D1 Digital Object
*/

export default defineType({
  name: 'DigitalObjectImage',
  type: 'image',
  title: 'Image',
  options: {
    hotspot: true,
    metadata: ['exif', 'location', 'lqip', 'palette'],
  },
  fields: [
    {
      name: 'alt',
      title: 'Alternative tekst',
      description: 'Important for SEO and accessiblity.',
      type: 'LocalizedString',
      validation: (Rule) => Rule.warning('You should to fill out the alternative text.'),
    }
  ],
  preview: {
    select: {
      title: 'alt',
      imageUrl: 'asset.url',
    },
  },
})
