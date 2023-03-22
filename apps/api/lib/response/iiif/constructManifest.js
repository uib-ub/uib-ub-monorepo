import { stringifyObject } from 'utils'
import { getBaseUrl } from '../../constants'

export async function constructManifest(data, API) {
  let manifest = {
    "@context": ["http://iiif.io/api/presentation/3/context.json"],
    id: data.id,
    type: data.type,
    label: data.label,
    summary: data.summary,
    metadata: [
      data.label !== null ? {
        label: {
          no: ["Tittel"],
          en: ["Title"]
        },
        value: data.label
      } : undefined,
      data.identifier ? {
        label: {
          en: ["Identifier"],
          no: ["Identifikator"],
        },
        value: {
          none: [data.identifier]
        }
      } : undefined,
    ],
    thumbnail: [
      {
        id: data.thumbnail['@value' ?? 'value'] ?? data.thumbnail,
        type: "Image",
        format: "image/jpeg",
        width: 250,
        height: 250
      }
    ],
    viewingDirection: "left-to-right",
    behavior: ["paged"],
    homepage: [
      {
        id: data.homepage,
        type: "Text",
        label: {
          no: ['Hjemmeside til objektet'],
          en: ['Homepage for the object'],
        },
        format: "text/html"
      }
    ],
    seeAlso: [
      {
        id: `${getBaseUrl()}/items/${data.identifier}`,
        type: "Dataset",
        label: {
          en: ["Object description in JSON format"],
          no: ["Objekt beskrivelse i JSON format"]
        },
        format: "application/ld+json"
      },
      {
        id: `${API}describe<${data.seeAlso}>`,
        type: "Dataset",
        label: {
          en: ["Object description in RDF"],
          no: ["Objekt beskrivelse i RDF"]
        },
        format: "text/turtle"
      }
    ],
    provider: [
      {
        id: "https://www.uib.no/ub",
        type: "Agent",
        label: {
          no: ["Universitetsbiblioteket i Bergen"],
          en: ["University of Bergen Library"]
        },
        homepage: [
          {
            id: "https://www.uib.no/ub",
            type: "Text",
            label: {
              no: ["Universitetsbiblioteket i Bergen hjemmeside"],
              en: ["University of Bergen Library Homepage"]
            },
            format: "text/html"
          }
        ],
        logo: [
          {
            id: "https://marcus-manifest-api.vercel.app/uib-logo.png",
            type: "Image",
            format: "image/png",
            width: 200,
            height: 200,
          }
        ]
      }
    ],
    rights: "http://creativecommons.org/licenses/by/4.0/",
    requiredStatement: {
      label: {
        no: ["Kreditering"],
        en: ["Attribution"]
      },
      value: {
        no: ["Tilgjengeliggjort av Universitetsbiblioteket i Bergen"],
        en: ["Provided by University of Bergen Library"]
      }
    },
    items: [
      ...data.items.map(canvas => {
        return {
          id: canvas.id,
          type: canvas.type,
          label: stringifyObject(canvas.label),
          width: 1024,
          height: 1024,
          thumbnail: [
            {
              id: canvas.thumbnail,
              type: "Image",
              width: 200,
              height: 200,
            }
          ],
          items: [
            {
              id: canvas.items.id,
              type: "AnnotationPage",
              items: [
                {
                  id: `${canvas.id}/annotation/1`,
                  type: "Annotation",
                  motivation: "painting",
                  target: canvas.id,
                  body: {
                    id: canvas.items?.['ubbont:hasXLView'] || canvas.items?.['ubbont:hasMDView'],
                    type: "Image",
                    format: "image/jpeg",
                    width: 1024,
                    height: 1024,
                  },
                }
              ]
            }
          ]
        }
      })
    ],
    structures: [
      {
        id: data.structures.id,
        type: data.structures.type,
        label: {
          no: ["Standard innholdsfortegnelse"],
          en: ["Default"]
        },
        items: [
          ...data.structures.items.map(item => {
            return {
              id: item,
              type: "Canvas",
            }
          })
        ]
      }
    ]
  }

  return manifest
}
