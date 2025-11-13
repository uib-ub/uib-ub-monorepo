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
  const manifestID = `${env.API_BASE_URL}/object/${filesetID}?as=iiif`
  // Find the first "Web Page" with an access_point hosted on marcus.uib.no
  // Find the Marcus web page URL directly
  const homepage = item.subject_of?.flatMap((subject: any) =>
    subject?.digitally_carried_by ?? []
  )
    .find(
      (digital: any) =>
        digital.classified_as?.some((cls: any) => cls._label === "Web Page") &&
        digital.access_point?.some(
          (ap: any) => typeof ap.id === "string" && ap.id.includes("marcus.uib.no")
        )
    )
    ?.access_point?.find(
      (ap: any) => typeof ap.id === "string" && ap.id.includes("marcus.uib.no")
    )?.id;

  console.log("🚀 ~ constructIIIFStructure ~ homepage:", homepage)

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
      value.nb = []
      value.en = []
    }

    return {
      label: {
        nb: ['Tittel'],
        nn: ['Tittel'],
        en: ['Title']
      },
      value
    }
  }

  const getIdentifiers = (identifiedBy: any): PreziMetadata => {
    const identifiers = identifiedBy.filter((name: any) => name.type === 'Identifier')

    return {
      label: {
        nb: ['Identifikator'],
        nn: ['Identifikator'],
        en: ['Identifier'],
      },
      value: {
        none: identifiers.map((identifier: any) => identifier.content)
      }
    }
  }
  const getConcepts = (shows: any): PreziMetadata => {
    const concepts = shows.flatMap((show: any) => show.represents_instance_of_type)

    return {
      label: {
        nb: ['Emner'],
      },
      value: {
        nb: concepts.map((concept: any) => concept._label)
      }
    }
  }

  // Create the manifest
  const manifest = builder.createManifest(
    manifestID,
    (manifest: any) => {

      const { value: label } = getTitles(item.identified_by);

      manifest.setLabel(Object.keys(label).length > 0 ? label : {
        "nb": ["Mangler tittel"],
        "nn": ["Manglar tittel"],
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
          nb: ['Hjemmeside til objektet'],
          nn: ['Heimeside til objektet'],
          en: ['Homepage for the object'],
        },
        format: "text/html"
      });
      manifest.setSeeAlso([
        {
          id: `${env.API_BASE_URL}/object/${filesetID}`,
          type: "Dataset",
          label: {
            nb: ["Objektbeskrivelse i JSON format"],
            nn: ["Objektskildring i JSON format"],
            en: ["Object description in JSON format"],
          },
          format: "application/ld+json"
        },
        {
          id: `${env.API_BASE_URL}/object/${filesetID}?as=ubbont`,
          type: "Dataset",
          label: {
            nb: ["Objekt beskrivelse i RDF"],
            nn: ["Objektskildring i RDF"],
            en: ["Object description in RDF"],
          }
        }
      ]);
      manifest.setRequiredStatement({
        label: {
          nb: ["Attribusjon"],
          en: ["Attribution"]
        },
        value: {
          nb: ["Tilgjengeliggjort av Universitetsbiblioteket i Bergen"],
          nn: ["Tilgjengeleggjort av Universitetsbiblioteket i Bergen"],
          en: ["Provided by University of Bergen Library"]
        }
      });
      manifest.setRights(getCopyright(item, filesetID));
      manifest.setMetadata([
        getIdentifiers(item.identified_by),
        getConcepts(item.shows),
      ]);

      if (fileset) {
        (fileset.data.hasPart).map((item: any) => {
          const root = `${env.API_BASE_URL}/object/${filesetID}`
          const canvasID = `${root}/canvas/${item.sequenceNr}`
          const annotationPageID = `${root}/canvas/${item.sequenceNr}/annotation-page/1`;
          const annotationID = `${root}/canvas/${item.sequenceNr}/annotation/1`;
          manifest.createCanvas(canvasID, (canvas: any) => {
            canvas.setLabel({
              nb: [item._label.none[0] ?? "Mangler tittel"],
            });
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
