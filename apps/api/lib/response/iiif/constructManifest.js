import { IIIFBuilder } from 'iiif-builder';
import { sortBy } from 'lodash';
import { stringifyObject } from 'utils';
import { getBaseUrl } from '../../constants';
import { constructMetadata } from './constructMetadata';

/**
 * Constructs a IIIF manifest
 * @param {object} data 
 * @param {object} metadata 
 * @param {string} API 
 * @returns {object} IIIF manifest
 */
export async function constructManifest(data, metadata, API) {
  // Initiate the builder
  const builder = new IIIFBuilder();

  // When madeObject is a single page we convert items and structures.items to an array of one
  data.items = Array.isArray(data.items) === false
    ? sortBy([data.items], o => o.label['@none'][0])
    : sortBy(data.items, o => o.label['@none'][0])

  data.structures.items = Array.isArray(data.structures.items) === false
    ? sortBy([data.structures.items], i => parseInt(i.split("_p")[1]))
    : sortBy(data.structures.items, i => parseInt(i.split("_p")[1]))

  // We assume all @none language tags are really norwegian
  data = JSON.parse(JSON.stringify(data).replaceAll('"@none":', '"no":'))

  // Construct the struture array, this is not required but it is nice to have
  const structures = [
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
  const extraMetadata = await constructMetadata(metadata)

  // Create the manifest
  const manifest = builder.createManifest(
    data.id,
    manifest => {
      manifest.setLabel(data.label),
        manifest.setSummary(data.summary),
        manifest.metadata = [
          data.identifier ? {
            label: {
              en: ["Identifier"],
              no: ["Identifikator"],
            },
            value: {
              none: [data.identifier]
            }
          } : undefined,
          extraMetadata ?? undefined
        ],
        manifest.addThumbnail({
          id: data.thumbnail['@value' ?? 'value'] ?? data.thumbnail,
          type: "Image",
          format: "image/jpeg",
          width: 250,
          height: 250
        }),
        manifest.setViewingDirection("left-to-right"),
        manifest.addBehavior("paged"),
        manifest.setHomepage({
          id: data.homepage,
          type: "Text",
          label: {
            no: ['Hjemmeside til objektet'],
            en: ['Homepage for the object'],
          },
          format: "text/html"
        }),
        manifest.setSeeAlso([
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
            id: `${API}describe<${data.seeAlso}>&output=json`,
            type: "Dataset",
            label: {
              en: ["Object description in RDF"],
              no: ["Objekt beskrivelse i RDF"]
            }
          }
        ]),
        manifest.provider = [
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
        manifest.setRequiredStatement({
          label: {
            no: ["Kreditering"],
            en: ["Attribution"]
          },
          value: {
            no: ["Tilgjengeliggjort av Universitetsbiblioteket i Bergen"],
            en: ["Provided by University of Bergen Library"]
          }
        }),
        manifest.setRights("http://creativecommons.org/licenses/by/4.0/"),
        data.items.map(item => {
          manifest.createCanvas(item.id, canvas => {
            canvas.setLabel(stringifyObject(item.label)),
              canvas.setWidth(1024),
              canvas.setHeight(1024),
              canvas.addThumbnail({
                id: item.thumbnail,
                type: "Image",
                format: "image/jpeg",
                width: 200,
                height: 200
              }),
              canvas.createAnnotationPage(`${item.items.id}/annotation-page/1`,
                page => {
                  const annotationID = `${item.items.id}/annotation/1`
                  page.createAnnotation({
                    id: annotationID,
                    type: "Annotation",
                    motivation: "painting",
                    body: {
                      id: item.items?.['ubbont:hasXLView'] || item.items?.['ubbont:hasMDView'] || item.items?.['ubbont:hasSMView'],
                      type: "Image",
                      format: "image/jpeg",
                      width: 1024,
                      height: 1024,
                    },
                  })
                })
          })
        })
    })

  // Convert to Presentation 3
  const jsonManifest = builder.toPresentation3({ id: manifest.id, type: 'Manifest' });

  // Add structures to manifest, as this is not supported by iiif-builder
  jsonManifest.structures = structures

  return jsonManifest
}
