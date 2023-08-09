import * as jsonld from 'jsonld'
import { getTimespan } from '../../../../../lib/response/muna/EDTF'
import Cors from 'cors'
import { API_URL } from '../../../../../lib/constants'
import { runMiddleware } from '../../../../../lib/request/runMiddleware'
import { getObjectData } from '../../../../../lib/request/apis/getObjectData'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

export default async function handler(req, res) {
  const {
    query: { id, context },
    method,
  } = req

  await runMiddleware(req, res, cors)

  let useIIIFContext = ""
  switch (context) {
    case "ubbont":
      useIIIFContext = context
      break;
    case "es":
      useIIIFContext = context
      break;
    default:
      useIIIFContext = "ubbont"
      break;
  }

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
        const response = await getObjectData(id, service.url)

        // Deal with response
        if (response.status >= 200 && response.status <= 299) {
          const result = await response.json()

          const awaitFramed = jsonld.frame(result, {
            '@context': [`${API_URL}/ns/${useIIIFContext}/context.json`],
            '@type': 'HumanMadeObject',
            '@embed': '@always',
          })
          let framed = await awaitFramed

          // Change id as this did not work in the query
          framed.id = `${API_URL}/items/${framed.identifier}`
          // We assume all @none language tags are really norwegian
          framed = JSON.parse(JSON.stringify(framed).replaceAll('"none":', '"no":'))

          framed.timespan = framed.timespan ? getTimespan(framed?.created, framed?.madeAfter, framed?.madeBefore) : framed.timespan
          delete framed?.madeAfter
          delete framed?.madeBefore

          // @TODO: Remove this when we have dct:modified on all items in the dataset
          framed.modified = framed.modified ?? "2020-01-01T00:00:00"

          res.status(200).json(framed)
        }
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
      }

      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
