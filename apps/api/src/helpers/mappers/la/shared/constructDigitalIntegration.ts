import { aatDigitalImageType, aatThumbnailsType, aatWebPageType } from '@/helpers/mappers/staticMapping';
import omitEmptyEs from 'omit-empty-es';

export const constructDigitalIntegration = (data: any) => {
  const {
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

  if (img) {
    imgArray = [{
      id: img[0],
      type: 'VisualItem',
      digitally_shown_by: [
        {
          type: 'DigitalObject',
          _label: {
            no: ['Digitalt objekt'],
            en: ['Digital object'],
          },
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

  if (seeAlso) {
    seeAlsoArray = seeAlso.map((item: any) => ({
      id: item['ubbont:hasURI'] ?? item.hasURI,
      _label: item._label,
    }));
  }

  if (thumbnail) {
    thumbnailArray = [{
      id: thumbnail,
      type: 'VisualItem',
      digitally_shown_by: [
        {
          type: 'DigitalObject',
          _label: {
            no: ['Digitalt objekt'],
            en: ['Digital object'],
          },
          classified_as: [
            aatDigitalImageType,
            aatThumbnailsType,
          ],
          access_point: [{
            id: thumbnail,
            type: 'DigitalObject',
          }]
        }
      ]
    }]
  }

  if (image) {
    imageArray = [{
      id: image,
      type: 'VisualItem',
      digitally_shown_by: [
        {
          type: 'DigitalObject',
          _label: {
            no: ['Digitalt objekt'],
            en: ['Digital object'],
          },
          classified_as: [
            aatDigitalImageType,
          ],
          access_point: [{
            id: image,
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
        _label: {
          no: ['Digitalt objekt'],
          en: ['Digital object'],
        },
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
                id: "http://iiif.io/api/presentation/",
                type: "InformationObject"
              }
            ],
            format: "application/ld+json;profile='http://iiif.io/api/presentation/3/context.json'"
          }
        ]
      }
    ]
  }

  // Always a string, as this is created by the query
  if (homepage) {
    subjectHomepageOf = [{
      id: homepage,
      type: "LinguisticObject",
      digitally_carried_by: [
        {
          id: homepage,
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

  if (page) {
    pageArray = page.map((item: any) => ({
      type: "LinguisticObject",
      _label: item._label,
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
