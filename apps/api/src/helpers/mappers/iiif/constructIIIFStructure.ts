import { env } from '@config/env';
import { IIIFBuilder } from '@iiif/builder';
import { getRightsStatements } from '@thegetty/linkedart.js';
import { getCopyright } from './getCopyright';
import { getThumbnailVisualItem } from './getThumbnailVisualItem';

/**
 * Constructs a IIIF manifest
 * @param {object} data 
 * @param {object} metadata 
 * @param {string} API 
 * @returns {object} IIIF manifest
 */
export function constructIIIFStructure(data: any) {
  // Initiate the builder
  const builder = new IIIFBuilder();

  const item = data.filter(i => i._index.startsWith('search-chc-items'))[0]
  const fileset = data.filter(i => i._index.startsWith('search-chc-fileset'))[0]

  const filesetID = fileset?._source.id

  const thumbnail = getThumbnailVisualItem(item._source)
  const manifestID = `${env.API_URL}/items/${filesetID}?as=iiif`
  const homepage = `https://marcus.uib.no/items/${filesetID}`
  const rightsStatement = getRightsStatements(item._source)
  console.log("🚀 ~ constructIIIFStructure ~ rightsStatement:", rightsStatement)

  // Create the manifest
  const manifest = builder.createManifest(
    manifestID,
    (manifest: any) => {
      manifest.setLabel(item._source._label ?? { "no": ["Mangler tittel"], "en": ["Missing title"] });
      if (thumbnail) {
        manifest.addThumbnail({
          id: thumbnail,
          type: "Image",
          format: "image/jpeg",
          width: 250,
          height: 250,
        });
      }
      manifest.addBehavior("paged");
      manifest.setHomepage({
        id: homepage,
        type: "Text",
        label: {
          no: ['Hjemmeside til objektet'],
          en: ['Homepage for the object'],
        },
        format: "text/html"
      });
      /* manifest.setSeeAlso([
        {
          id: `${API}/items/${data.identifier}`,
          type: "Dataset",
          label: {
            en: ["Object description in JSON format"],
            no: ["Objekt beskrivelse i JSON format"]
          },
          format: "application/ld+json"
        },
        {
          id: `${SOURCE}describe<${data.seeAlso}>&output=json`,
          type: "Dataset",
          label: {
            en: ["Object description in RDF"],
            no: ["Objekt beskrivelse i RDF"]
          }
        }
      ]); */
      manifest.setRequiredStatement({
        label: {
          no: ["Kreditering"],
          en: ["Attribution"]
        },
        value: {

          /* no: ["Tilgjengeliggjort av Universitetsbiblioteket i Bergen"],
          en: ["Provided by University of Bergen Library"] */
        }
      });
      manifest.setRights(getCopyright(item._source, filesetID));
      if (fileset) {
        fileset._source.data.hasPart.map((item: any) => {
          const root = `${env.API_URL}/items/${filesetID}`
          const canvasID = `${root}/canvas/${item.sequenceNr}`
          const annotationPageID = `${root}/canvas/${item.sequenceNr}/annotation-page/1`;
          const annotationID = `${root}/canvas/${item.sequenceNr}/annotation/1`;
          manifest.createCanvas(canvasID, (canvas: any) => {
            canvas.setLabel({ no: [item._label.none[0] ?? "Mangler tittel"] });
            canvas.setWidth(1024);
            canvas.setHeight(1024);
            canvas.addThumbnail({
              id: item.hasResource[0].hasTHView,
              type: "Image",
              format: "image/jpeg",
              width: 200,
              height: 200
            });
            canvas.createAnnotationPage(annotationPageID,
              (page: any) => {
                page.createAnnotation({
                  id: annotationID,
                  type: "Annotation",
                  motivation: "painting",
                  target: canvasID,
                  body: {
                    id: item.hasResource[0].hasXLView
                      || item.hasResource[0].hasMDView
                      || item.hasResource[0].hasSMView
                      || `http://error.io/${crypto.randomUUID()}`,
                    type: "Image",
                    format: "image/jpeg",
                    width: 1024,
                    height: 1024,
                  },
                });
              });
          });
        })
      }
    });


  const manifestV3: any = builder.toPresentation3({ id: manifest.id, type: 'Manifest' });
  manifestV3.identifier = data.identifier

  return manifestV3
}
