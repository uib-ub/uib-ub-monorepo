import omitEmptyEs from 'omit-empty-es';

export const constructDigitalIntegration = (data: any) => {
  const {
    thumbnail,
    image,
    subjectOfManifest,
    homepage,
    page,
  } = data;

  if (!thumbnail && !image && !subjectOfManifest && !homepage && !page) return data;

  delete data.thumbnail
  delete data.image
  delete data.subjectOfManifest
  delete data.homepage
  delete data.page

  let thumbnailArray: any[] = []
  let imageArray: any[] = []
  let subjectManifestOf: any[] = []
  let subjectHomepageOf: any[] = []
  let pageArray: any[] = []

  if (thumbnail) {
    thumbnailArray = [{
      id: thumbnail,
      type: 'VisualItem',
      digitally_shown_by: {
        type: 'DigitalObject',
        _label: {
          no: ['Digitalt objekt'],
          en: ['Digital object'],
        },
        classified_as: [
          {
            id: "http://vocab.getty.edu/aat/300215302",
            type: "Type",
            _label: "Digital Image"
          },
          {
            id: "http://fix.me",
            type: "Type",
            _label: "Thumbnails"
          },
        ],
        access_point: [{
          id: thumbnail,
          type: 'DigitalObject',
        },]
      }
    }]
  }

  if (image) {
    imageArray = [{
      id: image,
      type: 'VisualItem',
      digitally_shown_by: {
        type: 'DigitalObject',
        _label: {
          no: ['Digitalt objekt'],
          en: ['Digital object'],
        },
        classified_as: [
          {
            id: "http://vocab.getty.edu/aat/300215302",
            type: "Type",
            _label: "Digital Image"
          },
        ],
        access_point: [{
          id: image,
          type: 'DigitalObject',
        }],
      }
    }]
  }

  if (subjectOfManifest) {
    subjectManifestOf = [
      {
        id: subjectOfManifest,
        type: 'DigitalObject',
        _label: {
          no: ['Digitalt objekt'],
          en: ['Digital object'],
        },
        conforms_to: [
          {
            id: "http://iiif.io/api/presentation",
            type: "InformationObject"
          }
        ]
      }
    ]
  }

  if (homepage) {
    subjectHomepageOf = [{
      id: homepage,
      type: "LinguisticObject",
      digitally_carried_by: [
        {
          id: homepage,
          type: "DigitalObject",
          classified_as: [
            {
              id: "https://vocab.getty.edu/aat/300264578",
              type: "Type",
              _label: "Web Page"
            }
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
    pageArray = [{
      type: "LinguisticObject",
      _label: page._label,
      digitally_carried_by: [
        {
          type: "DigitalObject",
          classified_as: [
            {
              id: "http://vocab.getty.edu/aat/300264578",
              type: "Type",
              _label: "Web Page"
            }
          ],
          format: "text/html",
          access_point: [
            {
              id: page['ubbont:hasURI'] ?? page.hasURI,
              type: "DigitalObject"
            }
          ]
        }
      ]
    }]
  }


  return omitEmptyEs({
    ...data,
    representation: [
      ...thumbnailArray,
      ...imageArray,
    ],
    subject_of: [
      ...subjectManifestOf,
      ...subjectHomepageOf,
      ...pageArray,
    ]
  })
};
