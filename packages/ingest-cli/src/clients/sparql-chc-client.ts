import { env } from '../env'
import SparqlClient from 'sparql-http-client'

export const endpointUrl = env.SPARQL_CHC_ENDPOINT

const client = new SparqlClient({ endpointUrl })

export default client
