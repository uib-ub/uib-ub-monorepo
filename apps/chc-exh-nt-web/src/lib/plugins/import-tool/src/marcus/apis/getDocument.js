import { nanoid } from 'nanoid'
import { mapLicenses } from '../../shared/mapLicenses'
import { mapOwner } from '../../shared/mapOwner'
import { mapTypes } from '../../shared/mapTypes'
import { convertToBlock } from '../../shared/htmlUtils'
import Schema from '@sanity/schema'
import { mapLanguage } from '../../shared/mapLanguage'

const def = Schema.compile({
  name: 'myBlog',
  types: [
    {
      type: 'object',
      name: 'blogPost',
      fields: [
        {
          title: 'Title',
          type: 'string',
          name: 'title'
        },
        {
          title: 'Body',
          name: 'body',
          type: 'array',
          of: [
            {
              title: 'Block',
              type: 'block',
              styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'H1', value: 'h1' },
                { title: 'H2', value: 'h2' },
                { title: 'H3', value: 'h3' },
                { title: 'Quote', value: 'blockquote' },
              ],
              lists: [
                { title: 'Numbered', value: 'number' },
                { title: 'Bulleted', value: 'bullet' },
              ],
              marks: {
                annotations: [
                  {
                    name: 'link',
                    type: 'object',
                    title: 'External link',
                    fields: [
                      {
                        name: 'href',
                        type: 'url',
                        title: 'URL',
                        validation: Rule => Rule.uri({
                          scheme: ['http', 'https', 'mailto', 'tel']
                        })
                      },
                      {
                        title: 'Open in new tab',
                        name: 'blank',
                        description: 'Read https://css-tricks.com/use-target_blank/',
                        type: 'boolean',
                        initialValue: true
                      },
                    ],
                  },
                ],
              },
            },
          ],
        }
      ]
    }
  ]
})

const blockContentType = def.get('blogPost')
  .fields.find(field => field.name === 'body').type

export default function getDocument(item, assetID) {
  // Map type to Sanity types
  const types = mapTypes(Array.isArray(item.type) ? item.type : [item.type])

  const referredToBy = item.description ? Object.entries(item.description).map(([key, value]) => {
    return {
      _key: nanoid(),
      _type: 'LinguisticObject',
      accessState: 'open',
      editorialState: 'published',
      body: convertToBlock(blockContentType, value, true),
      hasType: {
        _key: nanoid(),
        _ref: 'd4b31289-91f4-484d-a905-b3fb0970413c',
        _type: 'reference',
      },
      language: {
        _key: nanoid(),
        _ref: mapLanguage(key),
        _type: 'reference',
      }
    }
  }) : undefined

  const subject = item.subject
    ? [
      ...item.subject.map((s) => {
        return {
          _type: 'Concept',
          _id: s.identifier,
          _rev: nanoid(),
          accessState: 'open',
          editorialState: 'published',
          label: {
            _type: 'LocalizedString',
            ...s.label
          },
        }
      }),
    ]
    : []

  const technique = item.technique
    ? [
      ...item.technique.map((s) => {
        return {
          _type: 'Technique',
          _id: s.identifier,
          _rev: nanoid(),
          accessState: 'open',
          editorialState: 'published',
          label: {
            _type: 'LocalizedString',
            ...s.label
          },
        }
      }),
    ]
    : []

  const maker = item.maker
    ? [
      ...item.maker.map((s) => {
        return {
          _type: 'Actor',
          _id: s.identifier,
          _rev: nanoid(),
          accessState: 'open',
          editorialState: 'published',
          label: {
            _type: "LocalizedString",
            ...s.label
          },
        }
      }),
    ]
    : []

  const depicts = item.depicts
    ? [
      ...item.depicts.map((s) => {
        return {
          _type: 'Actor',
          _id: s.identifier,
          _rev: nanoid(),
          accessState: 'open',
          editorialState: 'published',
          label: {
            _type: "LocalizedString",
            ...s.label
          },
        }
      }),
    ]
    : []

  const depictsRefs = item.depicts ?
    [
      ...item.depicts.map((s) => {
        return {
          _type: 'reference',
          _key: nanoid(),
          _ref: s.identifier,
        }
      }),
    ] : false

  const spatial = item.spatial
    ? [
      ...item.spatial.map((s) => {
        return {
          _type: 'Place',
          _id: s.identifier,
          _rev: nanoid(),
          accessState: 'open',
          editorialState: 'published',
          label: {
            _type: "LocalizedString",
            ...s.label
          },
          definedBy: {
            lat: s.lat,
            lng: s.long,
          }
        }
      }),
    ] : []

  const spatialRefs = item.spatial ?
    [
      ...item.spatial.map((s) => {
        return {
          _type: 'reference',
          _key: nanoid(),
          _ref: s.identifier,
        }
      }),
    ] : false

  const activityStream = [
    {
      _key: nanoid(),
      _type: 'Activity',
      subType: 'crm:Production',
      ...(item.maker && {
        contributionAssignedBy: [
          ...item.maker.map((s) => {
            return {
              _key: nanoid(),
              _type: 'ContributionAssignment',
              assignedActor: {
                _ref: s.identifier,
                _type: 'reference',
              },
            }
          }),
        ],
      }),
      ...(item.timespan && {
        timespan: {
          _key: nanoid(),
          _type: 'Timespan',
          ...item.timespan
        },
      }),
      ...(item.technique && {
        usedGeneralTechnique: [
          ...(item.technique && item.technique.map((s) => {
            return {
              _type: 'reference',
              _key: nanoid(),
              _ref: s.identifier,
            }
          }))
        ]
      })
    }
  ]

  const doc = {
    subject,
    technique,
    maker,
    depicts,
    spatial,
    doc: {
      _type: 'HumanMadeObject',
      _id: `${item.identifier}`,
      accessState: 'open',
      editorialState: 'published',
      label: {
        _type: 'LocalizedString',
        ...item.title
      },
      preferredIdentifier: item.identifier,
      homepage: item.homepage,
      subjectOfManifest: item.subjectOfManifest,
      identifiedBy: [
        {
          _type: 'Identifier',
          _key: nanoid(),
          content: item.identifier,
          hasType: {
            _type: 'reference',
            _key: nanoid(),
            _ref: '3f3e8a7a-d09d-46d4-8dff-7fa5fbff1340',
          },
        },
      ],
      license: mapLicenses(item.license),
      image: {
        _type: 'DigitalObjectImage',
        asset: {
          _type: 'reference',
          _ref: assetID,
        },
      },
      ...(Object.keys(activityStream[0]).length > 2 && {
        activityStream,
      }),
      ...(referredToBy && referredToBy.length > 0 && {
        referredToBy: referredToBy
      }),
      ...(item.subject && {
        subject: [
          ...item.subject.map((s) => {
            return {
              _type: 'reference',
              _key: nanoid(),
              _ref: s.identifier,
            }
          }),
        ],
      }),
      ...((depictsRefs || spatialRefs) && {
        depicts: [
          ...(depictsRefs ? depictsRefs : []),
          ...(spatialRefs ? spatialRefs : []),
        ],
      }),
      hasCurrentOwner: mapOwner(item.identifier),
      ...(types.length > 0 && { hasType: types }),
      wasOutputOf: {
        _type: 'DataTransferEvent',
        _key: nanoid(),
        /* _id: nanoid(36), <- Insert if this is to be changed to a reference */
        transferred: {
          _type: 'DigitalObject',
          _key: nanoid(),
          /* _id: item.id, */
          value: `"${JSON.stringify(item, null, 0)}"`,
        },
        timestamp: new Date(),
        hasSender: {
          _type: 'DigitalDevice',
          _key: nanoid(),
          /* _id: nanoid(36), */
          label: 'sparql.ub.uib.no',
        },
      },
    },
  }

  return doc
}
