import { aatDigitalImageType, aatLogoType, aatThumbnailsType, aatWebPageType } from '../staticMapping';
import omitEmptyEs from 'omit-empty-es';
import { coalesceLabel } from 'utils';

export const constructDigitalIntegration = (data: any) => {
  const {
    type,
    thumbnail,
    image,
    subjectOfManifest,
    homepage,
    ['foaf:homepage']: homepage2,
    page,
    img,
    seeAlso,
    logo,
    ['foaf:logo']: logo2,
  } = data;

  if (
    !thumbnail &&
    !image &&
    !subjectOfManifest &&
    !homepage &&
    !homepage2 &&
    !page &&
    !img &&
    !seeAlso &&
    !logo &&
    !logo2
  ) return data;

  delete data.thumbnail
  delete data.image
  delete data.subjectOfManifest
  delete data.homepage
  delete data.homepage2
  delete data.page
  delete data.img
  delete data.seeAlso
  delete data.logo
  delete data['foaf:logo']
  delete data['foaf:homepage']

  let thumbnailArray: any[] = []
  let imageArray: any[] = []
  let subjectManifestOf: any[] = []
  let subjectHomepageOf: any[] = []
  let pageArray: any[] = []
  let imgArray: any[] = []
  let seeAlsoArray: any[] = []
  let logoArray: any[] = [logo, logo2].filter(Boolean)

  if (seeAlso) {
    seeAlsoArray = seeAlso.map((item: string | any) => {
      // If item is a string, return object with just the id
      if (typeof item === 'string') {
        return {
          id: item,
          type: type,
          _label: item,
        }
      }
      // If item is an object, return formatted object
      return {
        id: item['ubbont:hasURI'] ?? item.hasURI,
        type: type,
        _label: item._label?.no[0] ?? item._label?.en[0] ?? 'Ukjent',
      }
    });
  }

  if (logoArray.length > 0) {
    logoArray = logoArray.map((logo: string | { id: string }) => {
      return {
        type: 'VisualItem',
        digitally_shown_by: [
          {
            type: 'DigitalObject',
            _label: 'Digitalt objekt',
            classified_as: [
              aatDigitalImageType,
              aatLogoType,
            ],
            access_point: [{
              id: typeof logo === 'string' ? logo : logo.id,
              type: 'DigitalObject',
            }]
          }
        ]
      }
    })
  }

  if (img?.length >= 1) {
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
            id: img?.[0],
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
  if (homepage || homepage2) {
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
              id: homepage ?? homepage2,
              type: "DigitalObject"
            }
          ]
        }
      ]
    }]
  }

  if (Array.isArray(page) && page.length > 0) {
    pageArray = page.map((item: any) => {
      // Handle string URLs
      if (typeof item === 'string') {
        return {
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
                  id: item,
                  type: "DigitalObject"
                }
              ]
            }
          ]
        }
      }

      // Handle object structure (existing code)
      return {
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
      }
    });
  }

  return omitEmptyEs({
    ...data,
    representation: [
      ...thumbnailArray,
      ...imageArray,
      ...imgArray,
      ...logoArray,
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
