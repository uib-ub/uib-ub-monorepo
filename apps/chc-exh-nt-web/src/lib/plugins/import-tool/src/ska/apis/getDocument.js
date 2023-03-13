import { nanoid } from 'nanoid'
import { mapLicenses } from '../../shared/mapLicenses'
import { mapOwner } from '../../shared/mapOwner'
import { mapTypes } from '../../shared/mapTypes'
import { getTimespan } from '../../shared/getTimespan'

export default function getDocument(item, assetID) {
  // Map type to Sanity types
  const types = mapTypes(Array.isArray(item.type) ? item.type : [item.type])

  const description = item.description ? Array.isArray(item.description) ? item.description : [item.description] : null
  const date = getTimespan(item.created?.value ?? item.created, item.madeAfter?.value ?? item.madeAfter, item.madeBefore?.value ?? item.madeBefore)

  const skaAsOwner = [{
    _type: 'Actor',
    _id: '083c8e77-52d1-4968-a26c-e899792495b2',
    _rev: nanoid(),
    accessState: 'open',
    editorialState: 'published',
    label: {
      _type: 'LocalizedString',
      no: 'Skeivt arkiv',
      en: 'The Norwegian archive for queer history',
    },
  }]

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
            no: Array.isArray(s.prefLabel) === false ? s.prefLabel : s.prefLabel[0],
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
            no: Array.isArray(s.name) === false ? s.name : s.name[0]
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
            no: Array.isArray(s.name) === false ? s.name : s.name[0]
          },
        }
      }),
    ]
    : []

  const activityStream = [
    {
      _key: nanoid(),
      _type: 'BeginningOfExistence',
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
      ...(date && {
        timespan: {
          _key: nanoid(),
          _type: 'Timespan',
          ...date,
          /* edtf: item.created.value,
          ...(item.madeAfter?.value ? { beginOfTheBegin: item.madeAfter?.value } : ''),
          ...(item.madeBefore?.value ? { endOfTheEnd: item.madeBefore?.value } : ''),
          ...(item.created?.value ? { date: parseDate(item.created?.value) } : ''), */
        },
      }),
    },
  ]

  const doc = {
    subject,
    maker,
    depicts,
    skaAsOwner,
    doc: {
      _type: 'HumanMadeObject',
      _id: `${item.identifier}`,
      accessState: 'open',
      editorialState: 'published',
      label: {
        _type: "LocalizedString",
        no: item.title
      },
      preferredIdentifier: item.identifier,
      homepage: item.homepage.id,
      subjectOfManifest: `https://api-ub.vercel.app/items/${item.identifier}/manifest`,
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
      ...(description && description.length > 0 && {
        referredToBy: [
          ...description.map(d => ({
            _key: nanoid(),
            _type: 'LinguisticObject',
            accessState: 'open',
            editorialState: 'published',
            body: [
              {
                _type: 'block',
                _key: nanoid(),
                style: 'normal',
                markDefs: [],
                children: [
                  {
                    _type: 'span',
                    _key: nanoid(),
                    text: d,
                    marks: [],
                  },
                ],
              },
            ],
            hasType: [
              {
                _key: nanoid(),
                _ref: 'd4b31289-91f4-484d-a905-b3fb0970413c',
                _type: 'reference',
              },
            ],
          })),
        ],
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
      ...(item.depicts && {
        depicts: [
          ...item.depicts.map((s) => {
            return {
              _type: 'reference',
              _key: nanoid(),
              _ref: s.identifier,
            }
          }),
        ],
      }),
      hasCurrentOwner: [
        {
          _type: 'reference',
          _key: nanoid(),
          _ref: '083c8e77-52d1-4968-a26c-e899792495b2'
        }
      ],
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
