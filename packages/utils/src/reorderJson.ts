interface Document {
  [key: string]: any
}

export function reorderDocument(doc: Document, order: string[]): Document {
  const reordered: Document = {};

  // First, add all keys from the desired order that exist in the document
  for (const key of order) {
    if (key in doc) {
      reordered[key] = doc[key];
    }
  }

  // Then, add any remaining keys from the document
  for (const key in doc) {
    if (!order.includes(key)) {
      reordered[key] = doc[key];
    }
  }

  return reordered;
}