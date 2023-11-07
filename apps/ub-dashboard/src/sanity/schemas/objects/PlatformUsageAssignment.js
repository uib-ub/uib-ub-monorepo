import { coalesceLabel } from "../helpers"
import { timespanSingleton } from "../props"

export const PlatformUsageAssignment = {
  name: 'PlatformUsageAssignment',
  type: 'object',
  title: 'Bruk av tjeneste',
  fields: [
    {
      name: 'assignedPlatform',
      title: 'Used platform',
      type: 'reference',
      to: [
        { type: 'Platform' },
      ],
      options: {
        semanticSanity: {
          '@type': '@id'
        }
      },
    },
    timespanSingleton,
  ],
  preview: {
    select: {
      platform: 'assignedPlatform.label',
      edtf: 'timespan.edtf'
    },
    prepare(selection) {
      const { platform, edtf } = selection
      return {
        title: coalesceLabel(platform),
        subtitle: edtf
      }
    },
  },
}
