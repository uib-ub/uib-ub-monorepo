import SparqlClient from 'sparql-http-client'

export const endpointUrl = 'https://sparql.ub.uib.no/spes'

const client = new SparqlClient({ endpointUrl })

export default client
