import { defineType } from 'sanity';

export default defineType({
  name: 'DigitalObject',
  type: 'object',
  title: 'Digitalt objekt',
  fields: [
    {
      name: 'value',
      title: 'Value',
      type: 'string',
    },
  ],
})
