import { defineType } from 'sanity';

export default defineType({
  name: 'DigitalObject',
  type: 'object',
  title: 'Digitalt objekt',
  titleEN: 'Digital object',
  fields: [
    {
      name: 'value',
      title: 'Value',
      type: 'string',
    },
  ],
})
