import { MdLink } from 'react-icons/md'
import { defineType, useClient } from 'sanity'
import { coalesceLabel } from '../../../../../helpers'

const baseLang = process.env.NEXT_PUBLIC_BASE_LANGUAGE

const getSubtitle = (slug, link, route) => {
  if (slug) {
    return ['/', slug].join('')
  }
  if (link) {
    return ['/', link].join('')
  }
  if (route) {
    return ['/', route].join('')
  }
  return null
}

function useAsyncSlugifier(input) {
  const client = useClient().withConfig({ apiVersion: '2021-10-21' })
  const query = '*[_id == $id][0]'
  const params = { id: input._ref }
  // eslint-disable-next-line consistent-return
  return client.fetch(query, params).then((doc) => {
    if (doc.title) {
      return doc.title.toLowerCase().replace(/\s+/g, '-').slice(0, 200)
    }
    if (doc.label) {
      return doc.label.toLowerCase().replace(/\s+/g, '-').slice(0, 200)
    }
  })
}

export default defineType({
  name: 'Route',
  type: 'document',
  title: 'Sti',
  titleEN: 'Landing page routes',
  icon: MdLink,
  fieldsets: [
    {
      title: 'Page',
      name: 'page',
      description: 'Slett sti eller ekstern lenke for å lenke til en side eller tekst.',
      options: { collapsible: true, collapsed: false },
    },
    {
      title: 'Link',
      name: 'paths',
      description: 'Slett referansen til siden for legge til en sti eller ekstern lenke.',
      options: { collapsible: true, collapsed: false }
    },
    {
      title: 'Colors',
      name: 'colors',
      description: 'Slett referansen til siden for legge til en sti eller ekstern lenke.',
      options: { columns: 2 }
    },
  ],
  groups: [
    {
      title: 'Colors',
      name: 'colors',
    }
  ],
  fields: [
    {
      name: 'label',
      title: 'Tittel',
      description: 'Lenkens tittel, om denne er tom brukes siden ellers tekstens tittel.',
      type: 'LocalizedString'
    },
    {
      name: 'page',
      title: 'Side',
      titleEN: 'Page',
      description: 'Siden du vil at skal vises på denne adressen. Siden må være publisert.',
      fieldset: 'page',
      type: 'reference',
      to: [
        { type: 'Page' },
        { type: 'LinguisticDocument' },
      ],
      hidden: ({ parent, value }) => !value && (parent?.route || parent?.link),
      options: {
        filter: '__i18n_lang == $base',
        filterParams: { base: baseLang },
        semanticSanity: {
          '@type': '@id'
        }
      },
    },
    {
      name: 'slug',
      title: 'Sti',
      description: 'Dette er adressen siden vil bli tilgjengelig på',
      fieldset: 'page',
      type: 'slug',
      hidden: ({ parent, value }) => !value && (parent?.route || parent?.link),
      validation: (Rule) =>
        Rule.custom((slug) => {
          if (slug && slug.current && slug.current === '/') {
            return 'Cannot be /'
          }
          return true
        }),
      options: {
        source: 'page',
        // Read more: https://www.sanity.io/docs/slug-type
        slugify: useAsyncSlugifier,
      },
    },
    {
      name: 'link',
      title: 'Ekstern lenke',
      description: 'Example: https://www.uib.no/ub',
      fieldset: 'paths',
      type: 'url',
      hidden: ({ parent, value }) => !value && (parent?.route || parent?.page)
    },
    {
      name: 'route',
      title: 'Sti til side i frontend',
      description: 'Referense til en "path" i frontend, som ikke er i Studioet. For eksempel "/abc".',
      fieldset: 'paths',
      type: 'string',
      hidden: ({ parent, value }) => !value && (parent?.page || parent?.link)
    },
    {
      name: 'openGraph',
      title: 'Open graph',
      description: 'Disse vil bli brukt i "meta tags"',
      type: 'OpenGraph',
      hidden: ({ parent, value }) => !value && (parent?.page || parent?.link),
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
    {
      name: 'backgroundColor',
      title: 'Bakgrunnsfarge',
      type: 'color',
      fieldset: 'colors',
      group: 'colors',
    },
    {
      name: 'foregroundColor',
      title: 'Forgrunnsfarge',
      type: 'color',
      fieldset: 'colors',
      group: 'colors',
    },
    {
      name: 'includeInSitemap',
      title: 'Inkluder i sitemap',
      description: 'For søkemotorer. Vil bli generert i /sitemap.xml',
      type: 'boolean',
      options: {
        semanticSanity: {
          "@type": "xsd:boolean"
        }
      },
    },
    {
      name: 'disallowRobots',
      title: 'Disallow in robots.txt',
      description: 'Skjul denne stien fra søkemoterer',
      type: 'boolean',
      options: {
        semanticSanity: {
          "@type": "xsd:boolean"
        }
      },
    },
  ],
  preview: {
    select: {
      slug: 'slug.current',
      label: 'label',
      pageLabel: 'page.label',
      link: 'link',
      route: 'route'
    },
    prepare({ slug, label, pageLabel, link, route }) {
      return {
        title: coalesceLabel(label) || pageLabel,
        subtitle: getSubtitle(slug, link, route),
      }
    },
  },
})
