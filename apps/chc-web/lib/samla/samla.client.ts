import 'server-only';

export const getSamlaIIIFv1TopCollectionData = async (): Promise<any> => {
  const res = await fetch(`https://viewer.samla.no/viewer/api/v1/collections/DC/`, { next: { revalidate: 4000 } });

  if (!res.ok) {
    if (res.status === 404) {
      return undefined
    } else {
      throw new Error('Failed to fetch data');
    }
  }

  return res.json();
}

export const getSamlaIIIFv1CollectionData = async (id: string): Promise<any> => {
  const res = await fetch(`https://viewer.samla.no/viewer/api/v1/collections/DC/${id}`, { next: { revalidate: 4000 } });

  if (!res.ok) {
    if (res.status === 404) {
      return undefined
    } else {
      throw new Error('Failed to fetch data');
    }
  }

  return res.json();
}


export const getSamlaIIIFv2RecordData = async (id: string): Promise<any> => {
  const res = await fetch(`https://viewer.samla.no/viewer/api/v2/records/${id}/manifest/`, { next: { revalidate: 4000 } });

  if (!res.ok) {
    if (res.status === 404) {
      return undefined
    } else {
      throw new Error('Failed to fetch data');
    }
  }

  return res.json();
}

