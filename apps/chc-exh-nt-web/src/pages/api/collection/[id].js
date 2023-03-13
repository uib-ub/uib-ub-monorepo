import { sanityClient, previewClient } from '../../../lib/sanity.server'
const getClient = (preview) => (preview ? previewClient : sanityClient)

const domain = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH
/* 
  Construct a IIIF Presentation v3 collection json
*/
const constructCollection = async (data) => {
  if (!data) {
    throw new Error('No input')
  }

  const collection = {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    ...data,
  }
  return collection
}

export default async function handler(req, res) {
  const { method, query: id } = req
  const preview = false

  async function getObject(preview = false) {
    const results = await getClient(id, preview).fetch(
      `
      *[_id == $id][0] {
        "id": "${domain}${basePath}/api/collection/" + _id,
        "type": "Collection",
        "label": {
          "no": [label.no]
        },
        "items":*[_type == "HumanMadeObject" && ^._id in hasCurrentOwner[]._ref] {
          "id": coalesce(subjectOfManifest, "${domain}${basePath}/api/manifest/" + _id),
          "type": "Manifest",
          "label": {
            "no": [label.no]
          },
          "thumbnail": [
            {
              "id": image.asset->url + '?h=200',
              "type": "Image",
              "format": "image/jpeg"
            }
          ]
        }                
      }`,
      id,
    )
    return results
  }

  switch (method) {
    case 'GET': {
      const results = getObject(id, preview)
      const object = await results
      const constructedManifest = constructCollection(object)
      const manifest = await constructedManifest

      // console.log('Collection served')
      res.status(200).json(manifest)
      break
    }
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
