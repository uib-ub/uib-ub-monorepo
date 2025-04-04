import { observeClient } from '@config/apis/esClient'
import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { cleanDateDatatypes } from '@helpers/cleaners/cleanDateDatatypes'
import { convertToFloat } from '@helpers/cleaners/convertToFloat'
import { useFrame } from '@helpers/useFrame'
import executeQuery from '@lib/executeQuery'
import { sqb } from '@lib/sparqlQueryBuilder'
import { itemSparqlQuery } from '@services/sparql/queries'
import { ItemTransformer } from './item.transformer'
import { HTTPException } from 'hono/http-exception'
import { ContextDefinition, JsonLdDocument } from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ZodHumanMadeObjectSchema } from 'types'
import { ZodSchema } from 'zod'
import { getFileSet } from '../file-sets/file_set.service'

export type FormatType = 'la' | 'ubbont' | 'iiif'

interface ItemIdentifier {
  id: string
  identifier: string
}

// Basic utilities remain the same
const createContextString = (namespace: string) =>
  `${env.API_URL}/ns/${namespace}/context.json`

const cleanData = (data: any) => {
  const fixedDates = cleanDateDatatypes(data)
  return convertToFloat(fixedDates)
}

const validateAndLog = (response: any, schema: ZodSchema, id: string) => {
  const parsed = schema.safeParse(response)
  if (!parsed.success) {
    console.log(parsed.error.issues)
    observeClient.index({
      index: 'logs-chc',
      body: {
        '@timestamp': new Date(),
        message: `id: ${id}, issues: ${JSON.stringify(parsed.error.issues)}`
      }
    })
  }
}

// Base transformation to LinkedArt - this will be our common foundation
const transformToLinkedArt = async (data: any, id: string) => {
  const cleanedData = cleanData(data)
  const framed: JsonLdDocument = await useFrame({
    data: cleanedData,
    context: ubbontContext as ContextDefinition,
    type: 'HumanMadeObject',
    id: cleanedData.id
  })

  const response = await ItemTransformer.toLinkedArt(
    framed,
    createContextString('ubbont')
  )

  validateAndLog(response, ZodHumanMadeObjectSchema as any, id)
  return response
}

// Ubbont transformation remains the same
const transformToUbbont = async (data: any, id: string) => {
  const cleanedData = cleanData(data)
  const framed: JsonLdDocument = await useFrame({
    data: cleanedData,
    context: ubbontContext as ContextDefinition,
    type: 'HumanMadeObject',
    id: cleanedData.id
  })

  return ItemTransformer.toUbbont(
    framed,
    createContextString('ubbont')
  )
}

// Modified IIIF transformation to explicitly show the LinkedArt dependency
const transformToIIIF = async (data: any, id: string) => {
  // First transform to LinkedArt
  const linkedArtData = await transformToLinkedArt(data, id)
  const fileset = await getFileSet(id, getServiceUrl('spes'))
  console.log("🚀 ~ transformToIIIF ~ fileset:", fileset)

  // Check if fileset was found
  if (!fileset || fileset.error) {
    throw new HTTPException(404, {
      message: fileset?.message || 'Fileset not found'
    })
  }

  // Then transform LinkedArt to IIIF
  return ItemTransformer.toIIIF(
    linkedArtData,
    fileset
  )
}

// Format configurations remain the same
const formatConfigs = {
  la: {
    query: itemSparqlQuery,
    transform: transformToLinkedArt,
  },
  ubbont: {
    query: itemSparqlQuery,
    transform: transformToUbbont,
  },
  iiif: {
    query: itemSparqlQuery,
    transform: transformToIIIF,
  }
} as const

const getServiceUrl = (source: string): string => {
  const service = DATA_SOURCES.find(service => service.name === source)
  if (!service) {
    throw new HTTPException(400, { message: `Invalid source: ${source}` })
  }
  return service.url
}

const fetchItemData = async (id: string, serviceUrl: string, query: string) => {
  return executeQuery(sqb(query, { id }), serviceUrl)
}

export const getItem = async (id: string, source: string, as: FormatType) => {
  const config = formatConfigs[as]
  if (!config) {
    throw new HTTPException(400, { message: `Invalid format: ${as}` })
  }

  const serviceUrl = getServiceUrl(source)
  const data = await fetchItemData(id, serviceUrl, config.query)
  return config.transform(data, id)
}

export const resolveItems = async (items: ItemIdentifier[], source: string, as: FormatType) => {
  try {
    const promises = items
      .map(item => getItem(item.identifier, source, as))
      .filter(Boolean)
    return await Promise.all(promises)
  } catch (error) {
    console.error('Error resolving items:', error)
    throw new HTTPException(500, { message: 'Failed to resolve items' })
  }
}