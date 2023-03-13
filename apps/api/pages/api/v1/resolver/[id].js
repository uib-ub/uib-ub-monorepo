export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req

  const query = `
    PREFIX  dct:  <http://purl.org/dc/terms/>

    ASK { 
      GRAPH ?g { 
        VALUES ?id { "${id}" }
        ?s dct:identifier ?id .
      }
    }
  `

  const askMarcus = await fetch(`${process.env.MARCUS_API}${query}`).then(res => res.json()).then(res => {
    if (res.boolean) {
      return {
        name: 'marcus',
        url: process.env.MARCUS_API,
      }
    }
  })
  const askSka = await fetch(`${process.env.SKA_API}${query}`).then(res => res.json()).then(res => {
    if (res.boolean) {
      return {
        name: 'skeivtarkiv',
        url: process.env.SKA_API,
      }
    }
  })

  switch (method) {
    case 'GET':
      // Find service with ID
      try {
        const response = await Promise.all([
          askMarcus,
          askSka,
        ]).then(res => res.filter(Boolean)[0])

        if (response) {
          res.status(200).json(response)
        } else {
          res.status(404).json({ message: "ID not found in any services." })
        }
      } catch (err) {
        throw new Error('err')
      }

      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
