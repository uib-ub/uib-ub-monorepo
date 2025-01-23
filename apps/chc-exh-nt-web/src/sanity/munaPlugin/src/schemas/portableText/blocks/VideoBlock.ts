import { MdOutlineLocalMovies } from 'react-icons/md'
import { defineType } from 'sanity'
import { labelSingleton } from '../../properties/datatype'

export default defineType({
  name: 'VideoBlock',
  type: 'object',
  title: 'Video',
  description: 'Embed video',
  icon: MdOutlineLocalMovies,
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    labelSingleton,
    {
      name: 'url',
      title: 'url',
      type: 'url',
    },

  ],
  preview: {
    select: {
      title: 'label',
      url: 'url',
    },
    prepare({ title, url }) {
      return {
        title: title,
        subtitle: `Video: ${url}`,
      }
    }
  },
})
