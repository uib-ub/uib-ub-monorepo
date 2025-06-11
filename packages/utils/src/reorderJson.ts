interface Document {
  [key: string]: any
}

export function reorderDocument(doc: Document, order: string[]): Document {
  const reordered: Document = {};
  const orderSet = new Set(order); // Convert order to a Set for O(1) lookups

  // First, add all keys from the desired order that exist in the document
  for (const key of order) {
    if (key in doc) {
      reordered[key] = doc[key];
    }
  }

  // Then, add any remaining keys from the document
  for (const key in doc) {
    if (!orderSet.has(key)) { // Use Set.has for efficient lookup
      reordered[key] = doc[key];
    }
  }

  return reordered;
}