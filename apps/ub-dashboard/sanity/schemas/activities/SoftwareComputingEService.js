import { referredToBy, timespanSingleton, labelSingleton, competence, availability, condidionOfUse } from '../props'

export const SoftwareComputingEService = {
  name: 'SoftwareComputingEService',
  type: 'document',
  title: 'Software computing service',
  liveEdit: true,
  fieldsets: [
    {
      name: 'core',
      title: 'Kjerne metadata',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'extra',
      title: 'Ekstra informasjon',
      options: { collapsible: true, collapsed: true },
    },
  ],
  groups: [
    {
      name: 'core',
      title: 'Kjerne metadata',
    },
    {
      name: 'extra',
      title: 'Ekstra informasjon',
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
      fieldset: 'core',
      group: 'core',
    },
    {
      ...timespanSingleton,
      fieldset: 'core',
      group: 'core',
    },
    {
      name: 'providedBy',
      title: 'Levert av',
      type: 'reference',
      to: [{ type: 'Group' }],
      fieldset: 'core',
      group: 'core',
    },
    {
      name: 'designatedAccessPoint',
      title: 'Access points',
      description: 'Tilgangspunkt for den overordnede hosten',
      type: 'AccessPoint',
      fieldset: 'core',
      group: 'core',
    },
    {
      name: 'deployHookSetting',
      title: 'Deploy hook settings',
      description: 'Hvordan oppdateres tjenesten?',
      type: 'array',
      of: [
        { type: 'VercelDeploymentConfig' },
        { type: 'NetlifyDeploymentConfig' },
      ],
      fieldset: 'core',
      group: 'core',
    },
    {
      name: 'runsOnRequest',
      title: 'Kjører software',
      type: 'reference',
      to: [
        { type: 'VolatileSoftware' },
        { type: 'Software' },
      ]
    },
    {
      name: 'accessPoint',
      title: 'Tilgangspunkt',
      description: 'Hvilke adresser har tjenesten?',
      type: 'array',
      of: [{ type: 'AccessPoint' }, {
        type: 'reference',
        to: [
          { type: 'AccessPoint' },
        ]
      }],
      initialValue: {
        _type: 'AccessPoint',
        hasType: {
          _type: 'reference',
          _ref: '904829b8-5722-4776-948c-8841a9c5bdd5' // HTTP
        }
      },
    },
    {
      name: 'provisionedBy',
      title: 'Provisjonert av',
      description: 'Dersom tjenesten er provisjonert av Ansible, Terraform eller lignende, lenk til koden.',
      type: 'array',
      of: [{
        type: 'reference',
        to: [
          { type: 'VolatileSoftware' },
        ]
      }]
    },
    {
      name: 'hostsDataset',
      title: 'Holder dataset',
      type: 'array',
      of: [{
        type: 'reference',
        to: [
          { type: 'Dataset' },
        ]
      }]
    },
    {
      name: 'curatesDataset',
      title: 'Kuraterer dataset',
      description: 'Er denne tjenesten "editor" for et datasett?',
      type: 'array',
      of: [{
        type: 'reference',
        to: [
          { type: 'Dataset' },
        ]
      }]
    },
    {
      ...competence,
      fieldset: 'extra',
      group: 'extra',
    },
    {
      ...availability,
      fieldset: 'extra',
      group: 'extra',
    },
    {
      ...condidionOfUse,
      fieldset: 'extra',
      group: 'extra',
    },
    {
      ...referredToBy,
      fieldset: 'extra',
      group: 'extra',
    },
  ],
  preview: {
    select: {
      title: 'label',
      providedBy: 'providedBy.label',
      edtf: 'timespan.edtf',
      media: 'providedBy.logo'
    },
    prepare(selection) {
      const { title, providedBy, edtf, media } = selection
      return {
        title: `📡 ${title} ${edtf ?? ''}`,
        subtitle: providedBy ? `Deployed by ${providedBy}` : 'Deployment',
        media: media,
      }
    },
  },
}
