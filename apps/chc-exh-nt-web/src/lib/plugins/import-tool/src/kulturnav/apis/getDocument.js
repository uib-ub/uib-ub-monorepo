import { parse } from 'date-fns'
import { nanoid } from 'nanoid'
import { mapLanguage } from '../../shared/mapLanguage'
import { mapTypes } from '../../shared/mapTypes'

const parseDate = (date) => {
  if (!date) {
    return null
  }
  const parsedDate = parse(date, 'yyyy-MM-dd', new Date())
  return parsedDate
}


const getLabel = (item) => {
  const { caption, properties } = item
  const { ['*']: k, ...restCaption } = caption
  const { ['*']: k2, ...restName } = properties['entity.name'][0].value

  // console.log(restCaption, restName)

  return {
    label: {
      _type: "LocalizedString",
      ...restCaption ?? '',
      ...restName ?? '',
    }
  }
}

const getDescription = (desc) => {
  const arr = []

  desc.forEach(([k, v]) => (
    arr.push({
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
              text: v,
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
      /* language: {
        _key: nanoid(),
        _ref: mapLanguage(k),
        _type: 'reference',
      }, */
    })
  ))
  return arr
}

export const getDocument = (item) => {
  console.log(item)
  const source = 'Kulturnav'
  const timestamp = new Date()
  const desc = item.properties['entity.description']?.[0]?.value ? Object.entries(item.properties['entity.description'][0].value) : {}
  const birthB = item.properties["person.birth"] ? `${item.properties["person.birth"]?.[0].value?.properties?.["event.time"]?.[0].value.slice(0, 4)}-01-01` : null
  const birthE = item.properties["person.birth"] ? `${item.properties["person.birth"]?.[0].value?.properties?.["event.time"]?.[0].value.slice(0, 4)}-12-31` : null
  const deathB = item.properties["person.death"] ? `${item.properties["person.death"]?.[0].value?.properties?.["event.time"]?.[0].value.slice(0, 4)}-01-01` : null
  const deathE = item.properties["person.death"] ? `${item.properties["person.death"]?.[0].value?.properties?.["event.time"]?.[0].value.slice(0, 4)}-12-31` : null
  // console.log(birthB, birthE, deathB, deathE)

  const doc = {
    _type: item.entityType == 'Concept' ? 'Concept' : 'Actor',
    _id: item.uuid,
    accessState: 'open',
    editorialState: 'published',
    ...getLabel(item),
    // preferredIdentifier: item.uuid,
    homepage: `https://kulturnav.org/${item.uuid}`,
    identifiedBy: [
      {
        _type: 'Identifier',
        _key: nanoid(),
        content: item.uuid,
        hasType: {
          _type: 'reference',
          _key: nanoid(),
          _ref: '3f3e8a7a-d09d-46d4-8dff-7fa5fbff1340',
        },
      },
    ],
    ...(item.properties['entity.description'] && {
      referredToBy: [
        ...getDescription(desc)
      ]
    }),
    ...(item.entityType != 'Concept' && { hasType: mapTypes([item.entityType]) }),
    // Which dataset does this belongs?
    ...(item.properties['entity.dataset'] && {
      inDataset: {
        _type: 'Dataset',
        _key: nanoid(),
        label: {
          _type: "LocalizedString",
          ...item.properties['entity.dataset'][0].displayValue
        },
        preferredIdentifier: item.properties['entity.dataset'][0].value,
        homepage: `https://kulturnav.org/${item.properties['entity.dataset'][0].value}`
      }
    }),
    ...((birthB || deathB) && {
      activityStream: [
        (birthB && {
          _key: nanoid(),
          _type: 'Birth',
          timespan:
          {
            _key: nanoid(),
            _type: 'Timespan',
            beginOfTheBegin: birthB,
            endOfTheEnd: birthE
          },
        }),
        (deathB && {
          _key: nanoid(),
          _type: 'Death',
          timespan: {
            _key: nanoid(),
            _type: 'Timespan',
            beginOfTheBegin: deathB,
            endOfTheEnd: deathE
          },
        })
      ]
    }),
    wasOutputOf: {
      _type: 'DataTransferEvent',
      _key: nanoid(),
      // _ref: nanoid(36), <- uncomment if changed to a document in schema
      label: `Transferred from ${source} at ${timestamp}`,
      timestamp: timestamp,
      transferred: {
        _type: 'DigitalObject',
        _key: nanoid(),
        // _ref: item.id,
        value: `"${JSON.stringify(item, null, 2)}"`,
      },
      hasSender: {
        _type: 'DigitalDevice',
        _key: nanoid(),
        // _ref: nanoid(36),
        label: 'https://kulturnav.org/api',
      },
    },
  }

  return doc
}

