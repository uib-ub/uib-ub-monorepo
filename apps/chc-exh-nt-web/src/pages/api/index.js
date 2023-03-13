export default function handler(req, res) {
  res.status(200).json({
    name: 'API',
    services: [
      {
        name: 'Collection',
        url: '/api/collection',
        description: 'Top level IIIF collection manifest',
      },
      {
        name: 'Collection ID',
        url: '/api/collection/[id]',
        description:
          'Get IIIF collection manifest for a Group owning objects used in the exhibition.',
        example: '/api/collection/782c5364-7324-4f16-b5af-2c60b73fc707',
      },
      {
        name: 'Manifest ID',
        url: '/api/manifest/[id]',
        description:
          'Get IIIF manifest for HumanMadeObject stored in the exhibition database, e.g. not imported from external source.',
        example: '/api/manifest/4eb0facf-8d5a-44cc-94ea-71ffe70fcc46',
      },
      {
        name: 'JSON-LD Dump',
        url: '/api/dump/json',
        description: 'Dump data as JSON-LD. Some document types are filtered.',
      },
      {
        name: 'N3 Dump',
        url: '/api/dump/rdf',
        description: 'Dump data as N3 RDF. Some document types are filtered.',
      },
    ],
  })
}
