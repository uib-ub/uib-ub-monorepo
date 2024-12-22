import { defineType } from 'sanity';

export default defineType({
  name: 'SlideshowStripBlock',
  type: 'object',
  title: 'Slideshow-strip',
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    {
      name: 'items',
      title: 'Vinduer',
      type: 'array',
      of: [{ type: 'HumanMadeObject' }],
    },
    {
      name: 'heading',
      title: 'Tittel',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Beskrivelse',
      type: 'simpleBlockContent',
    },
  ],
  preview: {
    select: {
      title: 'heading',
    },
    prepare: ({ title }) => ({
      title: title,
      subtitle: `Slideshow stripe`,
    }),
  },
})
