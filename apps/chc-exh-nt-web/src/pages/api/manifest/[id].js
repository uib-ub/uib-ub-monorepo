import { sanityClient, previewClient } from '../../../lib/sanity.server'
const getClient = (preview) => (preview ? previewClient : sanityClient)

const MANIFEST_SERVICE_URL = 'https://exh-nt.vercel.app/api/manifest'
const IMAGE_SERVICE_URL = 'exh-nt.vercel.app/api/image'

/* 
  Construct IIIF Image uri
*/
const fixIIIFUrl = (i) => {
  const url = new URL(i)
  const p = url.pathname.split('/')
  const imageUrl =
    url.protocol + '//' + IMAGE_SERVICE_URL + p.slice(0, -1).join('/') + '/iiif/' + p.slice(-1)
  return imageUrl
}

/* 
  Construct a IIIF Presentation v3 manifest json
*/
const constructManifest = async (object) => {
  if (!object) {
    throw new Error('No input')
  }

  const iiified = {
    ...object,
    images: object.images.map((i) => ({
      ...i,
      url: fixIIIFUrl(i.url),
    })),
  }

  const manifest = {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id: `${MANIFEST_SERVICE_URL}/${iiified._id}`,
    type: 'Manifest',
    label: { no: [`${iiified.label.no}`], en: [`${iiified.label.en}`] },
    /* metadata: [
      {
        label: { en: ["Creator"] },
        value: { en: ["Anne Artist (1776-1824)"] }
      }
    ], */
    provider: [
      {
        id: 'https://www.uib.no/ub',
        type: 'Agent',
        label: {
          no: ['Universitetsbiblioteket i Bergen'],
          en: ['University of Bergen Library'],
        },
        homepage: [
          {
            id: 'https://www.uib.no/ub',
            type: 'Text',
            label: {
              no: ['Universitetsbiblioteket i Bergen hjemmeside'],
              en: ['University of Bergen Library Homepage'],
            },
            format: 'text/html',
          },
        ],
        logo: [
          {
            id: 'http://marcus.uib.no/img/UiBmerke_grayscale.svg',
            type: 'Image',
            format: 'image/svg+xml',
          },
        ],
      },
    ],
    rights: iiified.license,
    requiredStatement: {
      label: {
        no: ['Kreditering'],
        en: ['Attribution'],
      },
      value: {
        no: ['Tilgjengeliggjort av Universitetsbiblioteket i Bergen'],
        en: ['Provided by University of Bergen Library'],
      },
    },
    items: [
      ...iiified.images.map((image, index) => {
        return {
          id: `${MANIFEST_SERVICE_URL}/${iiified._id}/canvas/p${index + 1}`,
          type: 'Canvas',
          label: {
            none: [`p${index + 1}`],
          },
          width: image.width,
          height: image.height,
          items: [
            {
              id: `${MANIFEST_SERVICE_URL}/${iiified._id}/page/p${index + 1}/${index + 1}`,
              type: 'AnnotationPage',
              items: [
                {
                  id: `${MANIFEST_SERVICE_URL}/${iiified._id}/annotation/${index + 1}-image`,
                  type: 'Annotation',
                  motivation: 'painting',
                  target: `${MANIFEST_SERVICE_URL}/${iiified._id}/canvas/p${index + 1}`,
                  body: {
                    id: `${image.url}/full/full/0/default.jpg`,
                    type: 'Image',
                    format: 'image/jpeg',
                    width: image.width,
                    height: image.height,
                    service: [
                      {
                        id: image.url,
                        type: 'ImageService2',
                        profile: 'level2',
                      }
                    ],
                  },
                },
              ],
            },
          ],
        }
      }),
    ],
    structures: [
      {
        id: `${MANIFEST_SERVICE_URL}/${iiified._id}/seq/s1`,
        type: 'Range',
        label: {
          en: ['Table of contents'],
        },
        items: [
          ...iiified.images.map((image, index) => {
            return {
              type: 'Canvas',
              id: `${MANIFEST_SERVICE_URL}/${iiified._id}/canvas/p${index + 1}`,
            }
          }),
        ],
      },
    ],
  }
  return manifest
}

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req
  const preview = false

  /* 
    Change the query to fit you data :-)
  */
  async function getObject(id, preview = false) {
    const results = await getClient(preview).fetch(
      `*[_id == $id] {
        _id,
        label,
        license,
        "images": coalesce(
          digitallyShownBy[].asset-> {
            url, 
            "height": metadata.dimensions.height,
            "width": metadata.dimensions.width
          }, 
          [image.asset-> {
            url, 
            "height": metadata.dimensions.height,
            "width": metadata.dimensions.width
          }]
        )
      }`,
      { id },
    )
    return results
  }

  switch (method) {
    case 'GET': {
      const results = getObject(id, preview)
      const object = await results
      const constructedManifest = constructManifest(object[0])
      const manifest = await constructedManifest

      /* console.log('Manfest served: ' + object[0]._id) */
      res.status(200).json(manifest)
      break
    }
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
