import jsonld, { ContextDefinition, JsonLdDocument } from 'jsonld';

/**
 * Compacts and frames the given data in NTriples format to JSON-LD format.
 * @param data - The data to be converted, in NTriples format.
 * @param context - The context to be used for compacting and framing.
 * @param type - The type to be used for framing.
 * @param id - The id to be used as root node when framing.
 * @returns A Promise that resolves to the framed JSON-LD data.
 */
export async function useFrame({ data, context, type, id }: { data: any, context: ContextDefinition, type?: string, id?: string }): Promise<JsonLdDocument> {
  if (!type && !id) {
    return { error: true, message: 'No type or id provided' }
  }

  let compacted: any
  let framed: any

  try {
    compacted = await jsonld.compact({
      '@graph': data,
    },
      context
    )
    // Rest of the code...
  } catch (e) {
    console.log(JSON.stringify(e, null, 2))
    return { error: true, message: e }
  }

  const hasTypeAsString = ((compacted['@graph'] as any).filter((i: any) => i.identifier === id)[0]?.hasType as string).toLowerCase()
    ?? (compacted.hasType as string).toLowerCase()

  try {
    framed = await jsonld.frame(compacted, {
      ...context,
      ...id && !type && { '@id': `http://data.ub.uib.no/instance/${hasTypeAsString}/${id}` },
      ...type && !id && { '@type': type },
      '@embed': '@always',
    });
  } catch (e) {
    console.log(JSON.stringify(e, null, 2))
    return { error: true, message: e }
  }

  return framed
}
