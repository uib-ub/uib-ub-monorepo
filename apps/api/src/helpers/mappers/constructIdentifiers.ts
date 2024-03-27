import { de, id } from 'date-fns/locale'

export const constructIdentifiers = (data: any) => {
  const { _label, identifier, previousIdentifier } = data
  console.log(_label, identifier, previousIdentifier)

  const previous = {
    _label: `${previousIdentifier}`,
    type: 'Identifier',
    classified_as: [
      {
        id: "https://vocab.getty.edu/aat/300312355",
        type: "Type",
        _label: "Accession Number"
      },
      {
        id: "https://vocab.getty.edu/aat/300449151",
        type: "Type",
        _label: "Historical terms"
      },
    ],
    content: previousIdentifier,
  }

  const id = {
    _label: `${identifier}`,
    type: 'Identifier',
    classified_as: [
      {
        id: "https://vocab.getty.edu/aat/300404620",
        type: "Type",
        _label: "Catalog numbers"
      },
      {
        id: "https://vocab.getty.edu/aat/300404670",
        type: "Type",
        _label: "Preferred terms"
      }
    ],
    content: identifier,
  }

  const getLanguage = (lang: string) => {
    switch (lang) {
      case 'no':
        return {
          id: "https://vocab.getty.edu/aat/300443706",
          type: "Language",
          _label: "Norwegian"
        }
      case 'en':
        return {
          id: "https://vocab.getty.edu/aat/300388277",
          type: "Language",
          _label: "English"
        }
      case 'fr':
        return {
          id: "https://vocab.getty.edu/aat/300388306",
          type: "Language",
          _label: "French"
        }
      default:
        return {
          id: "https://vocab.getty.edu/aat/300443706",
          type: "Language",
          _label: "Norwegian"
        }
    }
  }

  let names: any[] = []
  if (_label) {
    names = Object.entries(_label).map(([key, value]: [string, unknown]) => {
      return {
        type: "Name",
        classified_as: [
          {
            id: "http://vocab.getty.edu/aat/300404670",
            type: "Type",
            _label: "Primary Name"
          },
          (value as string[])[0].includes('[', 0) ? {
            id: "https://vocab.getty.edu/aat/300417205",
            type: "Type",
            _label: "Constructed titles"
          } : undefined,
        ],
        content: value,
        language: [
          getLanguage(key)
        ]
      }
    })
  }

  delete data.previousIdentifier

  return {
    ...data,
    identified_by: [
      ...names,
      identifier ? id : undefined,
      previousIdentifier ? previous : undefined,
    ],
  }
}



/* 
"Identifier": {
  "title": "crm:E42_Identifier",
  "description": "An identifier for an entity\nSee: [API](https://linked.art/api/1.0/shared/identifier/) | [Model](https://linked.art/model/base/#identifiers)",
  "type": "object",
  "properties": {
    "_label": {
      "$ref": "#/definitions/labelProp"
    },
    "type": {
      "allOf": [
        {
          "title": "General",
          "$ref": "#/definitions/typeProp"
        },
        {
          "title": "Specific",
          "type": "string",
          "const": "Identifier"
        }
      ]
    },
    "identified_by": {
      "$ref": "#/definitions/identified_byProp"
    },
    "classified_as": {
      "$ref": "#/definitions/classified_asProp"
    },
    "content": {
      "$ref": "#/definitions/contentProp"
    },
    "part": {
      "description": "A list of one or more `Identifier` structures, which are parts of this `Identifier`",
      "type": "array",
      "items": {
        "$ref": "#/definitions/Identifier"
      }
    },
    "assigned_by": {
      "description": "The activity through which this `Identifier` was assigned to the entity",
      "type": "array",
      "items": {
        "$ref": "#/definitions/AttributeAssignment"
      }
    }
  },
  "required": [
    "type",
    "content"
  ],
  "additionalProperties": false
},
*/