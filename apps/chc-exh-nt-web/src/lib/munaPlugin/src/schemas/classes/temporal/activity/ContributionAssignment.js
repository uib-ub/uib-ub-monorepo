import { defineType } from 'sanity'
import { coalesceLabel } from '../../../../helpers'
import { assignedActor, assignedRole, usedName } from '../../../properties/object'

export default defineType({
  name: 'ContributionAssignment',
  type: 'object',
  title: 'Bidragspåstand',
  fields: [
    assignedActor,
    assignedRole,
    usedName,
  ],
  preview: {
    select: {
      actor: 'assignedActor.label',
      name: 'usedName.content',
      role: 'assignedRole.0.label',
    },
    prepare(selection) {
      const { actor, name, role } = selection
      return {
        title: name || coalesceLabel(actor),
        subtitle: `${role ? coalesceLabel(role) : ''}`,
      }
    },
  },
})
