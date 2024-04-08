import { getItemData } from '../../services/legacy_item_ubbont.service';

export async function resolveIds(ids: any, source: string, context: string, type: string): Promise<any> {
  try {
    const promises = ids.map((item: { id: string, identifier: string }) => getItemData(item.identifier, source, context, type))
    const data = await Promise.all(promises);
    return data;
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw error;
  }
}