import { defineType } from 'sanity';

export default defineType({
  name: 'DigitalDevice',
  type: 'object',
  title: 'Digital ting',
  titleEN: 'Digital device',
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
    },
  ],
})
