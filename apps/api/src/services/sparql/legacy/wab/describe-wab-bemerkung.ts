import jsonld from 'jsonld'
import { DATA_SOURCES } from '../../../../config/constants';
import contexts from '../../../../config/jsonld-contexts';

const WAB_API = DATA_SOURCES.filter((service) => service.name === 'wab')[0].url

export async function describeWabBemerkung(id: string) {
  try {
    const results = await fetch(
      `${WAB_API}${encodeURIComponent(
        `describe <${id}>`
      )}&output=json`).then((res: any) => res.json());

    // Expand and compact the results using the legacy context
    const expanded = await jsonld.expand(results)
    const compacted = await jsonld.compact(expanded, contexts.wabLegacyContext)
    delete compacted["@context"]

    return compacted;
  } catch (error) {
    return error;
  }
}