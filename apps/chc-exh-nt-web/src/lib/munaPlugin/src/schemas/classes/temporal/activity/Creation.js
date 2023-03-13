import { IoMdCreate } from 'react-icons/io'
import { defineType } from 'sanity'
import { featured } from '../../../properties/datatype'
import { contributionAssignedBy, timespanSingleton, tookPlaceAt } from '../../../properties/object'

export default defineType({
  name: 'Creation',
  type: 'document',
  title: 'Skapelse',
  icon: IoMdCreate,
  fields: [
    featured,
    tookPlaceAt,
    contributionAssignedBy,
    timespanSingleton,
  ],
  preview: {
    select: {
      contributor: 'contributionAssignedBy.0.asignedActor.label',
      contributorName: 'contributionAssignedBy.0.usedName.content',
    },
    prepare(selection) {
      const { contributor, contributorName } = selection

      return {
        title: `Creation, by ${contributor || contributorName || 'unknown'}`,
        subtitle: edtf
      }
    },
  },
})
