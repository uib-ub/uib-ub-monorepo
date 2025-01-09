import { GiSettingsKnobs } from 'react-icons/gi'
import { license } from '../../../../properties/datatype'
import { coalesceLabel } from '../../../../../helpers/coalesceLabel'
import { defineType } from 'sanity';
import { identifiedBy } from '../../../../properties/object';

const baseLang = process.env.NEXT_PUBLIC_BASE_LANGUAGE

export default defineType({
  name: 'SiteSettings',
  type: 'document',
  title: 'Nettsideinnstillinger',
  icon: GiSettingsKnobs,
  // '__experimental_actions': ['update', /* 'create', 'delete', */ 'publish'],
  groups: [
    {
      name: 'media',
      title: 'Media',
    }
  ],
  fields: [
    {
      name: 'label',
      title: 'Tittel',
      type: 'LocalizedString',
    },
    identifiedBy,
    {
      name: 'description',
      title: 'Beskrivelse',
      type: 'LocalizedText',
    },
    {
      name: 'frontpage',
      title: 'Forside',
      type: 'reference',
      to: [
        { type: 'Page' }
      ],
      options: {
        filter: '__i18n_lang == $base',
        filterParams: {
          base: baseLang
        },
        semanticSanity: {
          '@type': '@id'
        }
      },
    },
    {
      name: 'footer',
      title: 'Footer page',
      description: 'Select page for the footer',
      type: 'reference',
      to: [{ type: 'Page' }],
      options: {
        semanticSanity: {
          '@type': '@id'
        }
      },
    },
    {
      name: 'keyword',
      title: 'Nøkkelord',
      description: 'Legg til nøkkelord som beskriver nettsiden',
      type: 'LocalizedKeyword',
    },
    {
      name: 'publisher',
      title: 'Utgiver',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'Actor' },
          ]
        }
      ],
      options: {
        semanticSanity: {
          '@container': '@list',
          '@type': '@id'
        }
      },
    },
    license,
    {
      name: 'logo',
      title: 'Logo',
      description:
        'Bruk helst en SVG hvor fargen er satt med currentColor',
      group: 'media',
      type: 'image',
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessiblity.',
        },
      ],
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
    {
      name: 'image',
      title: 'Bilde',
      description: 'Facebook anbefaler 1200x630 (størrelsen blir endret automatisk)',
      group: 'media',
      type: 'DigitalObjectImage',
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
  ],
  preview: {
    select: {
      title: 'label',
    },
    prepare({ title }) {
      return {
        title: coalesceLabel(title),
      }
    },
  },
})
