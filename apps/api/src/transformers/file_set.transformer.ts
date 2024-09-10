import { cleanJsonld } from '@helpers/cleaners/cleanJsonLd'
import { useFrame } from '@helpers/useFrame'
import { ContextDefinition, JsonLdDocument } from 'jsonld'

export const toFileSetTransformer = async (data: any, context: any) => {
  const framed: JsonLdDocument = await useFrame({ data: data, context: context as ContextDefinition, type: 'Aggregation', id: data[0].id })
  let cleaned = cleanJsonld(framed)[0]
  // Sort the hasPart property in cleaned
  cleaned.hasPart = cleaned.hasPart.sort((a: any, b: any) => parseInt(a.sequenceNr) - parseInt(b.sequenceNr))

  return {
    id: cleaned._label.none[0],
    data: cleaned
  };
}