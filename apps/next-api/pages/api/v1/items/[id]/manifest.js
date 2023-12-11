import Cors from 'cors'
import * as jsonld from 'jsonld'
import { omit } from 'lodash'
import { API_URL } from '../../../../../lib/constants'
import { getManifestSeedData } from '../../../../../lib/request/apis/getManifestSeedData'
import { runMiddleware } from '../../../../../lib/request/runMiddleware'
import { constructManifest } from '../../../../../lib/response/iiif/constructManifest'
import { manifestFrame } from '../../../../../lib/response/iiif/frames/manifestFrame'

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req

  await runMiddleware(req, res, cors)

  switch (method) {
    case 'GET':

      // Find the service that contains data on this item
      const checkedServices = await fetch(`${API_URL}/resolver/${id}?v=1`)
      if (checkedServices.status === 404) {
        return res.status(404).json({ message: 'Not found' })
      }
      if (!checkedServices.ok) {
        return res.status(400).json({ message: 'Bad request' })
      }

      try {
        const service = await checkedServices.json()
        const response = await getManifestSeedData(id, service.url)

        if (response.status == 503) {
          res.status(503).json({ message: "Service is unavailable" })
        }

        if (response.status >= 200 && response.status <= 299) {
          const results = await response.json();
          // console.log("🚀 ~ file: manifest.js:201 ~ handler ~ results:", results)

          // Frame the result for nested json
          const awaitFramed = jsonld.frame(results, {
            '@context': manifestFrame,
            '@type': 'Manifest'
          });
          let framed = await awaitFramed
          // console.log("🚀 ~ file: manifest.js:209 ~ handler ~ framed:", framed)

          // Remove json-ld context 
          framed = omit(framed, ["@context"])

          if (Object.keys(framed).length === 0) {
            return res.status(404).json({ message: 'Not found' })
          }

          // Get the 
          const allMetadata = await fetch(`${API_URL}/items/${id}`).then(res => res.json())

          // Create the manifest
          let manifest = await constructManifest(framed, allMetadata, service.url)


          res.status(200).json(manifest)
        }
      } catch (error) {
        console.log("🚀 ~ file: manifest.js:257 ~ handler ~ error", error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
