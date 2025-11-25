import { env } from '@env';
import { IIIFBuilder } from '@iiif/builder';
import { getCopyright } from './getCopyright';
import { getThumbnailVisualItem } from './getThumbnailVisualItem';
import { getBehavior } from './mapClassToClassifiedAs';
import { getLanguage } from './getLanguage';

/**
 * Constructs a IIIF manifest
 * @param {object} data 
 * @param {object} metadata 
 * @param {string} API 
 * @returns {object} IIIF manifest
 */
export function constructIIIFStructure(item: any, fileset: any) {
  // Initiate the builder
  const builder = new IIIFBuilder();

  const filesetID = fileset.id.split('/').pop()
  console.log("🚀 ~ constructIIIFStructure ~ filesetID:", filesetID)

  const thumbnail = getThumbnailVisualItem(item)
  const manifestID = `${env.API_BASE_URL}/items/${filesetID}?as=iiif`
  const homepage = `https://marcus.uib.no/items/${filesetID}`

  //const mainType = get
  const getLabel = (item: any): { [key: string]: string[] } => {
    const names = item.identified_by?.filter((name: any) =>
      name.type === 'Name' &&
      name.classified_as?.some((type: any) =>
        type._label === 'Primary Name' || type._label === 'Translated Name'
      )
    ) ?? [];

    const label: { [key: string]: string[] } = {};

    if (names.length > 0) {
      names.forEach((name: any) => {
        const lang = name.language?.[0]?._label === 'Norwegian' ? 'no' : 'en';
        if (!label[lang]) label[lang] = [];
        label[lang].push(name.content);
      });
    }

    return label;
  }

  type PreziMetadata = {
    label: Record<string, string[]>
    value: Record<string, string[]>
  }

  const getTitles = (identifiedBy: any): PreziMetadata => {
    const titles = identifiedBy.filter((name: any) => name.type === 'Name' &&
      name.classified_as?.some((type: any) =>
        type._label === 'Primary Name' || type._label === 'Translated Name'
      )
    )

    // Initialize value object
    const value: Record<string, string[]> = {}

    // Group titles by language
    titles.forEach((title: any) => {
      const lang = getLanguage(title.language?.[0]?.id) as string
      if (!value[lang]) {
        value[lang] = []
      }
      value[lang].push(title.content)
    })

    // If no titles were found, default to empty arrays
    if (Object.keys(value).length === 0) {
      value.no = []
      value.en = []
    }

    return {
      label: {
        no: ['Tittel'],
        en: ['Title']
      },
      value
    }
  }

  const getIdentifiers = (identifiedBy: any): PreziMetadata => {
    const identifiers = identifiedBy.filter((name: any) => name.type === 'Identifier')

    return {
      label: {
        no: ['Identifikator'],
        en: ['Identifier'],
      },
      value: {
        none: identifiers.map((identifier: any) => identifier.content)
      }
    }
  }

  // Create the manifest
  const manifest = builder.createManifest(
    manifestID,
    (manifest: any) => {

      const label = getLabel(item);

      manifest.setLabel(Object.keys(label).length > 0 ? label : {
        "no": ["Mangler tittel"],
        "en": ["Missing title"]
      });
      if (thumbnail) {
        manifest.addThumbnail({
          id: thumbnail,
          type: "Image",
          format: "image/jpeg",
          width: 250,
          height: 250,
        });
      }
      manifest.addBehavior(getBehavior(item.classified_as[0].id));
      manifest.setHomepage({
        id: homepage,
        type: "Text",
        label: {
          no: ['Hjemmeside til objektet'],
          en: ['Homepage for the object'],
        },
        format: "text/html"
      });
      manifest.setSeeAlso([
        {
          id: `${env.API_BASE_URL}/items/${filesetID}`,
          type: "Dataset",
          label: {
            en: ["Object description in JSON format"],
            no: ["Objekt beskrivelse i JSON format"]
          },
          format: "application/ld+json"
        },
        {
          id: `${env.API_BASE_URL}/items/${filesetID}?as=ubbont`,
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
      manifest.setRights(getCopyright(item, filesetID));
      manifest.setMetadata([
        getTitles(item.identified_by),
        getIdentifiers(item.identified_by),
      ]);

      if (fileset) {
        (fileset.data.hasPart).map((item: any) => {
          const root = `${env.API_BASE_URL}/items/${filesetID}`
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
  manifestV3.identifier = item.identifier

  return manifestV3
}
