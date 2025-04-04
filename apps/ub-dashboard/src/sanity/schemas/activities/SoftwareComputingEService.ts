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
          { title: 'Slettet', value: 'deleted' },
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
      type: 'reference',
      to: [{ type: 'AccessPoint' }],
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
      type: 'array',
      of: [{
        type: 'reference',
        to: [
          { type: 'VolatileSoftware' },
          { type: 'Software' },
        ]
      }]
    },
    {
      name: 'accessPoint',
      title: 'Tilgangspunkt',
      description: 'Hvilke adresser har tjenesten?',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'AccessPoint' }]
      }],
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
    prepare(selection: any) {
      const { title, providedBy, edtf, media } = selection
      return {
        title: `📡 ${title} ${edtf ?? ''}`,
        subtitle: providedBy ? `Run by ${providedBy}` : 'Deployment',
        media: media,
      }
    },
  },
}
