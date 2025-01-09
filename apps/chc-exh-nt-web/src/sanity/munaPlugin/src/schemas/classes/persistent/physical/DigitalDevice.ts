import { defineType } from 'sanity';

export default defineType({
  name: 'DigitalDevice',
  type: 'object',
  title: 'Digital ting',
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
    },
  ],
})
