export const IllustrationWithCaption = {
  type: 'object',
  name: 'IllustrationWithCaption',
  title: 'Illustrasjon med bildetekst',
  fields: [
    {
      name: 'title',
      title: 'Tittel',
      type: 'string',
    },
    {
      name: 'content',
      title: 'Tekst',
      type: 'text',
    },
    {
      name: 'illustration',
      title: 'Illustrasjonsbilde',
      type: 'Illustration',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'label',
      media: 'illustration',
    },
    prepare({ title, media }: any) {
      return {
        title: title,
        subtitle: `Illustrasjon`,
        media: media?.image,
      }
    },
  },
}
