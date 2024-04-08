import omitEmptyEs from 'omit-empty-es';

export const constructDigitalIntegration = (data: any) => {
  const {
    thumbnail,
    image,
    subjectOfManifest,
    homepage,
  } = data;

  if (!thumbnail && !image) return data;

  delete data.thumbnail
  delete data.image
  delete data.subjectOfManifest
  delete data.homepage

  let thumbnailObject = {}
  let imageObject = {}
  let subjectOf: any[] = []

  if (thumbnail) {
    thumbnailObject = {
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
    }
  }

  if (image) {
    imageObject = {
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
    }
  }

  if (subjectOfManifest) {
    subjectOf = [
      {
        id: subjectOfManifest,
        type: 'DigitalObject',
        _label: {
          no: ['Digitalt objekt'],
          en: ['Digital object'],
        },
        /* conforms_to: [
          {
            id: "http://iiif.io/api/presentation",
            type: "InformationObject"
          }
        ] */
      }
    ]
  }


  return omitEmptyEs({
    ...data,
    ...(thumbnail || image ? {
      representation: [
        thumbnailObject,
        imageObject,
      ]
    } : undefined),
    subject_of: [
      ...subjectOf,
      (homepage ? {
        id: homepage,
        type: "LinguisticObject",
        digitally_carried_by: [
          {
            id: homepage,
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
                id: homepage,
                type: "DigitalObject"
              }
            ]
          }
        ]
      } : undefined)
    ]
  })
};
