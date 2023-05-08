export async function getSamlaIIIFv1TopCollectionData(): Promise<any> {
  const res = await fetch(`https://viewer.samla.no/viewer/api/v1/collections/DC/`, { next: { revalidate: 1800 } });

  if (!res.ok) {
    return undefined
  }

  return res.json();
}

export async function getSamlaIIIFv1CollectionData(id: string): Promise<any> {
  const res = await fetch(`https://viewer.samla.no/viewer/api/v1/collections/DC/${id}`, { next: { revalidate: 1800 } });

  if (!res.ok) {
    return undefined
  }

  return res.json();
}


export async function getSamlaIIIFv2RecordData(id: string): Promise<any> {
  const res = await fetch(`https://viewer.samla.no/viewer/api/v2/records/${id}/manifest/`, { next: { revalidate: 1800 } });

  if (!res.ok) {
    return undefined
  }

  return res.json();
}

