export const IllustrationWithCaption = {
  type: 'object',
  name: 'IllustrationWithCaption',
  title: 'Illustrasjon med bildetekst',
  titleEN: 'Illustration with caption',
  options: {
    semanticSanity: {
      exclude: true
    }
  },
  fields: [
    {
      name: 'title',
      title: 'Tittel',
      titleEN: 'Title',
      type: 'string',
    },
    {
      name: 'content',
      title: 'Tekst',
      titleEN: 'Text',
      type: 'text',
    },
    {
      name: 'illustration',
      title: 'Illustrasjonsbilde',
      titleEN: 'Illustration',
      type: 'Illustration',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'label',
      media: 'illustration',
    },
    prepare({ title, media }) {
      return {
        title: title,
        subtitle: `Illustrasjon`,
        media: media?.image,
      }
    },
  },
}
