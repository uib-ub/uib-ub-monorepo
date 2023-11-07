import { referredToBy, timespanSingleton, labelSingleton, identifiedBy } from '../props'

export const HostingService = {
  name: 'HostingService',
  type: 'document',
  title: 'Hosting service',
  liveEdit: true,
  fieldsets: [
    {
      name: 'minimum',
      title: 'Minimumsregistrering',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Aktiv', value: 'active' },
          { title: 'Arkivert', value: 'archive' },
          { title: 'Forlatt', value: 'abandoned' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    },
    {
      ...labelSingleton,
      description: ''
    },
    {
      name: 'mainId',
      title: 'Identifier',
      description: 'Could be GitLab ID or Github name like "owner/repo".',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'remoteName',
      title: 'Remote navn',
      description: 'Add name of this remote, "origin" will be used as the main repository if there are multiple hosts.',
      type: 'string',
      validation: Rule => Rule.required(),
      initialValue: 'origin'
    },
    /* {
      ...identifiedBy,
      of: [{ type: 'Identifier' }]
    }, */
    {
      name: 'componentOf',
      title: 'Hosting provider',
      description: 'Who provides this service?',
      validation: Rule => Rule.required(),
      type: 'reference',
      to: [{ type: 'SoftwareDeliveryEService' }]
    },
    {
      name: 'designatedAccessPoint',
      title: 'Service access point',
      type: 'AccessPoint'
    },
    {
      name: 'hasPlatformCapability',
      title: 'Is platform?',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'deployHookSetting',
      title: 'Deploy hook settings',
      type: 'array',
      hidden: ({ parent, value }) => !value && parent?.hasPlatformCapability !== true,
      of: [
        { type: 'GitLabCIConfig' },
      ],
      /* fieldset: 'core',
      group: 'core', */
    },
    {
      name: 'hasComputingCapability',
      title: 'Is host?',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'accessPoint',
      title: 'Tilgangspunkt',
      description: 'If this is a host, what domain is available?',
      type: 'array',
      of: [{ type: 'AccessPoint' }],
      initialValue: {
        _type: 'AccessPoint',
        hasType: {
          _type: 'reference',
          _ref: '5431bffa-69eb-450d-9c2f-a614d560b9db'
        }
      },
      hidden: ({ parent, value }) => !value && parent?.hasComputingCapability !== true,
    },
    timespanSingleton,
    referredToBy,
  ],
  preview: {
    select: {
      title: 'label',
      provider: 'componentOf.label',
      accessPoint: 'designatedAccessPoint.0.url',
      edtf: 'timespan.edtf',
      media: 'componentOf.logo',
      providerLogo: 'componentOf.providedBy.logo',
    },
    prepare(selection) {
      const { title, provider, edtf, accessPoint, media, providerLogo } = selection
      return {
        title: `🗄️ ${title ?? provider} ${edtf ?? ''}`,
        subtitle: provider ?? accessPoint,
        media: media ?? providerLogo,
      }
    },
  },
}
