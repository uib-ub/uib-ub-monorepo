import { defineType } from 'sanity'

export default defineType({
  name: 'Illustration',
  type: 'object',
  title: 'Illustrasjon',
  fields: [
    {
      name: 'image',
      title: 'Bilde',
      type: 'DigitalObjectImage',
    },
  ],
  preview: {
    select: {
      image: 'image',
    },
    prepare({ image }) {
      if (!image) {
        return { title: 'Illustrasjon uten bilde' }
      }
      return {
        title: `Illustrasjon`,
        subtitle: `${image.caption || image.alt || 'Mangler bildetekst eller "alt" tekst'
          } | Size: ${image.size || 'default'}`,
        media: image,
      }
    },
  },
})
