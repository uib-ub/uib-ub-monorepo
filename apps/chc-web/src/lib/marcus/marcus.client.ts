import "server-only";
import { API_URL } from "../constants";

export async function getItemData(id: string): Promise<any> {
  const res = await fetch(`${API_URL}/items/${id}`, {
    next: { revalidate: 3200 },
  });
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    if (res.status === 404) {
      return undefined;
    } else {
      throw new Error("Failed to fetch data");
    }
  }

  return res.json();
}
