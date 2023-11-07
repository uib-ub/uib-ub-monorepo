import { hasType, labelSingleton, link, programmedWith, referredToBy, shortDescription, uses } from "./props";

export const VolatileSoftware = {
  name: 'VolatileSoftware',
  title: 'Source code',
  type: 'document',
  liveEdit: true,
  fieldsets: [
    {
      name: 'core',
      title: 'Kjernemetadata',
      options: {
        collapsible: true,
        collapsed: false,
      }
    },
    {
      name: 'extra',
      title: 'Ekstra',
      options: {
        columns: 2
      },
    }
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
    },
    {
      ...shortDescription,
    },
    {
      ...hasType,
      fieldset: 'core',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'SoftwareType' }] }
      ]
    },
    {
      name: 'hostedBy',
      title: 'Source code hosted by',
      fieldset: 'core',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'HostingService' }]
      }]
    },
    {
      name: 'runBy',
      title: 'Deployed by',
      fieldset: 'core',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'SoftwareComputingEService' }] }]
    },
    {
      name: 'documentationAccessPoint',
      title: 'Dokumentasjon',
      fieldset: 'core',
      type: 'array',
      of: [{ type: 'AccessPoint' }]
    },
    {
      ...referredToBy,
      fieldset: 'core',
    },
    {
      ...programmedWith,
      fieldset: 'extra',
      description: 'Only use if necessary, prefer to register on source code.'
    },
    {
      ...uses,
      fieldset: 'extra',
    },
    link,
    /* This feels wrong... {
      name: 'curatedBy',
      title: 'Kuratert av',
      type: 'reference',
      to: [
        { type: 'SoftwareCuratingService' },
      ]
    }, */
  ],
  preview: {
    select: {
      title: 'label',
    },
    prepare({ title }) {
      return {
        title: `⌨️ ${title}`,
        subtitle: `Kildekode`,
      };
    },
  },
}