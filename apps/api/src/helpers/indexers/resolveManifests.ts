import { getManifestData } from '@services/sparql/marcus/manifest.service';

export async function resolveManifests(ids: any, source: string, context: string, type: string): Promise<any> {
  try {
    const promises = ids.map((item: { id: string, identifier: string }) => getManifestData(item.identifier, source, context, type))
    const data = await Promise.all(promises);
    return data;
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw error;
  }
}