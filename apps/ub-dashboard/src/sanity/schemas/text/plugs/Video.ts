export const Video = {
  name: 'Video',
  type: 'object',
  title: 'Video',
  description: 'Embed video',
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    {
      name: 'title',
      title: 'Tittel',
      type: 'string',
    },
    {
      name: 'url',
      title: 'url',
      type: 'url',
    },
  ],
  preview: {
    select: {
      title: 'title',
      url: 'url',
    },
    /* component: Youtube, */
    prepare({ url }: any) {
      return {
        title: `Video: ${url}`,
      }
    }
  },
}
