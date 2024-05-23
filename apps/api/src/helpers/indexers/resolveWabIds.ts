import { getWabBemerkung } from '@services/sparql/wab/get-wab-bemerkung';

export async function resolveWabIds(ids: any): Promise<any> {
  try {
    const promises = ids.map((item: { id: string, url: string }) => getWabBemerkung(item.id))
    const data = await Promise.all(promises);
    return data;
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw error;
  }
}