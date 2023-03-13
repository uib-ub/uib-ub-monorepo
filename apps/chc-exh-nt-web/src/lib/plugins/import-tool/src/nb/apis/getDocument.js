import { nanoid } from 'nanoid'
import { mapTypes } from '../../shared/mapTypes'

export const getDocument = async (item) => {
  const types = mapTypes(item.metadata.mediaTypes)

  const doc = {
    _type: 'HumanMadeObject',
    _id: `${item.id}`,
    accessState: 'open',
    editorialState: 'published',
    license:
      item.accessInfo && item.accessInfo.isPublicDomain
        ? 'https://creativecommons.org/publicdomain/mark/1.0/'
        : 'https://rightsstatements.org/vocab/CNE/1.0/',
    label: {
      _type: "LocalizedString",
      no: item.metadata.title
    },
    preferredIdentifier: item.id,
    homepage: `https://urn.nb.no/${item.metadata.identifiers.urn}`,
    identifiedBy: [
      {
        _type: 'Identifier',
        _key: nanoid(),
        content: item.id,
        hasType: {
          _type: 'reference',
          _key: nanoid(),
          _ref: '3f3e8a7a-d09d-46d4-8dff-7fa5fbff1340',
        },
      },
    ],
    hasCurrentOwner: [
      {
        _type: 'reference',
        _key: nanoid(),
        _ref: '37f7376a-c635-420b-8ec6-ec0fd4c4a55c',
      },
    ],
    subjectOfManifest: item._links.presentation.href,
    hasType: types,
    wasOutputOf: {
      _type: 'DataTransferEvent',
      _key: nanoid(),
      /* _ref: nanoid(36), <- uncomment if changed to a document in schema */
      transferred: {
        _type: 'DigitalObject',
        _key: nanoid(),
        /* _ref: item.id, */
        value: `"${JSON.stringify(item, null, 0)}"`,
      },
      timestamp: new Date(),
      hasSender: {
        _type: 'DigitalDevice',
        _key: nanoid(),
        /* _ref: nanoid(36), */
        label: 'api.nb.no',
      },
    },
  }

  return doc
}