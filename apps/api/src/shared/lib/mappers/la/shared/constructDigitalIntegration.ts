import { aatDigitalImageType, aatThumbnailsType, aatWebPageType } from '@shared/lib/mappers/la/staticMapping';
import omitEmptyEs from 'omit-empty-es';
import { coalesceLabel } from '@shared/utils/coalesceLabel';
export const constructDigitalIntegration = (data: any) => {
  const {
    type,
    thumbnail,
    image,
    subjectOfManifest,
    homepage,
    page,
    img,
    seeAlso,
  } = data;

  if (
    !thumbnail &&
    !image &&
    !subjectOfManifest &&
    !homepage &&
    !page &&
    !img &&
    !seeAlso
  ) return data;

  delete data.thumbnail
  delete data.image
  delete data.subjectOfManifest
  delete data.homepage
  delete data.page
  delete data.img
  delete data.seeAlso

  let thumbnailArray: any[] = []
  let imageArray: any[] = []
  let subjectManifestOf: any[] = []
  let subjectHomepageOf: any[] = []
  let pageArray: any[] = []
  let imgArray: any[] = []
  let seeAlsoArray: any[] = []

  if (seeAlso) {
    seeAlsoArray = seeAlso.map((item: any) => ({
      id: item['ubbont:hasURI'] ?? item.hasURI,
      type: type,
      _label: item._label?.no[0] ?? item._label?.en[0] ?? 'Ukjent',
    }));
  }

  if (img) {
    imgArray = [{
      type: 'VisualItem',
      digitally_shown_by: [
        {
          type: 'DigitalObject',
          _label: 'Digitalt objekt',
          classified_as: [
            aatDigitalImageType,
            aatThumbnailsType,
          ],
          access_point: [{
            id: img[0],
            type: 'DigitalObject',
          }]
        }
      ]
    }]
  }

  if (thumbnail) {
    thumbnailArray = [{
      type: 'VisualItem',
      digitally_shown_by: [
        {
          type: 'DigitalObject',
          _label: 'Digitalt objekt',
          classified_as: [
            aatDigitalImageType,
            aatThumbnailsType,
          ],
          access_point: [{
            id: Array.isArray(thumbnail) ? thumbnail[0] : thumbnail,
            type: 'DigitalObject',
          }]
        }
      ]
    }]
  }

  if (image) {
    imageArray = [{
      type: 'VisualItem',
      digitally_shown_by: [
        {
          type: 'DigitalObject',
          _label: 'Digitalt objekt',
          classified_as: [
            aatDigitalImageType,
          ],
          access_point: [{
            id: Array.isArray(image) ? image[0] : image,
            type: 'DigitalObject',
          }],
        }
      ]
    }]
  }

  if (subjectOfManifest) {
    subjectManifestOf = [
      {
        type: 'LinguisticObject',
        _label: 'Digitalt objekt',
        digitally_carried_by: [
          {
            type: "DigitalObject",
            access_point: [
              {
                id: subjectOfManifest,
                type: "DigitalObject"
              }
            ],
            conforms_to: [
              {
                id: "https://iiif.io/api/presentation/",
                type: "InformationObject"
              }
            ],
            format: "application/ld+json;profile='https://iiif.io/api/presentation/3/context.json'"
          }
        ]
      }
    ]
  }

  // Always a string, as this is created by the query
  if (homepage) {
    subjectHomepageOf = [{
      type: "LinguisticObject",
      digitally_carried_by: [
        {
          type: "DigitalObject",
          classified_as: [
            aatWebPageType,
          ],
          format: "text/html",
          access_point: [
            {
              id: homepage,
              type: "DigitalObject"
            }
          ]
        }
      ]
    }]
  }

  if (Array.isArray(page) && page.length > 0) {
    pageArray = page.map((item: any) => ({
      type: "LinguisticObject",
      _label: coalesceLabel(item._label),
      digitally_carried_by: [
        {
          type: "DigitalObject",
          classified_as: [
            aatWebPageType,
          ],
          format: "text/html",
          access_point: [
            {
              id: item['ubbont:hasURI'] ?? item.hasURI,
              type: "DigitalObject"
            }
          ]
        }
      ]
    }));
  }

  return omitEmptyEs({
    ...data,
    representation: [
      ...thumbnailArray,
      ...imageArray,
      ...imgArray,
    ],
    subject_of: [
      ...subjectManifestOf,
      ...subjectHomepageOf,
      ...pageArray,
    ],
    equivalent: [
      ...seeAlsoArray,
    ],
  })
};
