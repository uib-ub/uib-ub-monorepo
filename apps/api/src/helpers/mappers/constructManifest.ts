import { PROVIDER_UB } from '@config/iiifConfig';
import { stringifyObject } from '@helpers/stringifyObject';
import { IIIFBuilder } from '@iiif/builder';
import sortBy from 'lodash/sortBy';
import rtlDetect from 'rtl-detect-intl';

/**
 * Constructs a IIIF manifest
 * @param {object} data 
 * @param {object} metadata 
 * @param {string} API 
 * @returns {object} IIIF manifest
 */
export function constructManifest(data: any, API: string, SOURCE: string, PROVIDER?: any) {
  // Initiate the builder
  const builder = new IIIFBuilder();

  data.items = Array.isArray(data.items) === false
    ? sortBy([data.items], (i: any) => parseInt(i.id.split("_p")[1]))
    : sortBy(data.items, (i: any) => parseInt(i.id.split("_p")[1]))

  data.structures.items = Array.isArray(data.structures.items) === false
    ? sortBy([data.structures.items], (i: any) => parseInt(i.id.split("_p")[1]))
    : sortBy(data.structures.items, (i: any) => parseInt(i.id.split("_p")[1]))

  // We assume all @none language tags are really norwegian
  data = JSON.parse(JSON.stringify(data).replaceAll('"@none":', '"no":'))

  // Create the manifest
  const manifest = builder.createManifest(
    data.id ?? `http://error.io/${crypto.randomUUID()}`,
    (manifest: any) => {
      manifest.setLabel(data.label);
      manifest.setSummary(data.summary);
      data.thumbnail?.length > 0 ? manifest.addThumbnail({
        id: data.thumbnail[0] ?? `http://error.io/${crypto.randomUUID()}`, // TODO: Data cleanup. We can have multiple thumbnails, but we only use the first one
        type: "Image",
        format: "image/jpeg",
        width: 250,
        height: 250
      }) : undefined;
      manifest.addBehavior("paged");
      manifest.setHomepage({
        id: data.homepage[0] ?? data.homepage,
        type: "Text",
        label: {
          no: ['Hjemmeside til objektet'],
          en: ['Homepage for the object'],
        },
        format: "text/html"
      });
      manifest.setSeeAlso([
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
      ]);
      manifest.setRequiredStatement({
        label: {
          no: ["Kreditering"],
          en: ["Attribution"]
        },
        value: {
          no: ["Tilgjengeliggjort av Universitetsbiblioteket i Bergen"],
          en: ["Provided by University of Bergen Library"]
        }
      });
      manifest.setRights("http://creativecommons.org/licenses/by/4.0/");
      data.items ? data.items.map((item: any) => {
        const randomID = crypto.randomUUID()
        const canvasIdentifier = item.id ? parseInt(String(item.id).toString().split("_p")[1]) : randomID
        const domain = data.id ?? `http://error.io`
        const canvasID = `${domain}/canvas/${canvasIdentifier}`
        const annotationPageID = `${domain}/canvas/${canvasIdentifier}/annotation-page/1`;
        const annotationID = `${domain}/canvas/${canvasIdentifier}/annotation/1`;
        manifest.createCanvas(canvasID, (canvas: any) => {
          canvas.setLabel(stringifyObject(item.label ?? "Mangler tittel"));
          canvas.setWidth(1024);
          canvas.setHeight(1024);
          item.thumbnail?.length > 0 ? canvas.addThumbnail({
            id: item.thumbnail[0] ?? `http://error.io/${crypto.randomUUID()}`, // TODO: compacting and framing should not return prefixed keys!
            type: "Image",
            format: "image/jpeg",
            width: 200,
            height: 200
          }) : undefined;
          canvas.createAnnotationPage(annotationPageID,
            (page: any) => {
              page.createAnnotation({
                id: annotationID,
                type: "Annotation",
                motivation: "painting",
                target: canvasID,
                body: {
                  id: item.items?.hasXLView?.[0]
                    || item.items?.hasMDView?.[0]
                    || item.items?.hasSMView?.[0]
                    || `http://error.io/${crypto.randomUUID()}`,
                  type: "Image",
                  format: "image/jpeg",
                  width: 1024,
                  height: 1024,
                },
              });
            });
        });
      }) : undefined;
    });

  // Convert to Presentation 3
  const manifestV3: any = builder.toPresentation3({ id: manifest.id, type: 'Manifest' });

  // Construct the struture array, this is not required but it is nice to have
  const structures = [
    {
      id: data.structures.id,
      type: data.structures.type,
      label: {
        no: ["Standard innholdsfortegnelse"],
        en: ["Default table of contents"]
      },
      items: [
        ...data.structures.items.map((item: any) => {
          return {
            id: `${data.id}/canvas/${parseInt(String(item.id).toString().split("_p")[1])}`,
            type: "Canvas",
          }
        })
      ]
    }
  ]

  manifestV3.identifier = data.identifier

  // Add structures and provider to manifest, as this is not supported by iiif-builder
  manifestV3.viewingDirection = rtlDetect.isRtlLang(data.language ?? 'no') ? "right-to-left" : "left-to-right"
  manifestV3.structures = structures;
  manifestV3.provider = [
    PROVIDER ? PROVIDER : undefined,
    PROVIDER_UB
  ].filter(Boolean);

  return manifestV3
}
