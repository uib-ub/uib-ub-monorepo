import jsonld, { ContextDefinition } from 'jsonld'
import { CONTEXTS } from 'jsonld-contexts';
import { cleanDateDatatypes } from './cleaners/cleanDateDatatypes';
import { convertToFloat } from './cleaners/convertToFloat';
import omitEmptyEs from 'omit-empty-es';

/**
 * Compacts and frames the given data in NTriples format to JSON-LD format.
 * @param data - The data to be converted, in NTriples format.
 * @param context - The context to be used for compacting and framing.
 * @param type - The type to be used for framing.
 * @returns A Promise that resolves to the framed JSON-LD data.
 */
const compactAndFrameNTriples = async (data: any, context: string, type: string) => {
  // @TODO: Add support for multiple contexts?
  const useContext = CONTEXTS[context as keyof typeof CONTEXTS]

  // We get the data as NTriples, so we need to convert it to JSON-LD
  const json = await jsonld.fromRDF(data)
  const fixedDates = cleanDateDatatypes(json)
  const withFloats = convertToFloat(fixedDates)

  const compacted = await jsonld.compact({
    '@graph': withFloats,
    ...useContext as ContextDefinition
  },
    useContext as ContextDefinition
  ) // Compact to JSON-LD

  try {
    const framed = await jsonld.frame(compacted, {
      ...useContext as ContextDefinition,
      '@type': type,
      '@embed': '@always',
    });
    return omitEmptyEs(await framed)
  } catch (e) {
    console.log(JSON.stringify(e, null, 2))
    return { error: true, message: e }
  }
}

export default compactAndFrameNTriples