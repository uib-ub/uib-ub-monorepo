import { defineType } from 'sanity'
import { coalesceLabel } from '../../../../helpers';
import { label } from '../../../properties/datatype'
import { hasMember } from '../../../properties/object'

export default defineType({
  name: 'Set',
  type: 'object',
  title: 'Sett',
  titleEN: 'Set',
  description:
    'Brukes til å samle objekter i et sett, der settet er knyttet til for eksempel en samling.',
  fields: [
    label,
    hasMember
  ],
  preview: {
    select: {
      title: 'label',
      members: 'hasMember',
    },
    prepare({ title, members }) {
      return {
        title: `${coalesceLabel(title)}`,
        subtitle: `${members.length} objects`,
      };
    },
  },
})
