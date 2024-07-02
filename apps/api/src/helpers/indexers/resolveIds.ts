import { getLaItem } from './getLaItem';

export async function resolveIds(ids: any, source: string): Promise<any> {
  try {
    const promises = ids.map((item: { id: string, identifier: string }) => getLaItem(item.identifier, source)).filter(Boolean);
    const data = await Promise.all(promises);
    return data;
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw error;
  }
}