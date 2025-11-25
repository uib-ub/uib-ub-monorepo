/**
 * Retrieves the thumbnail visual item from the given data.
 * 
 * @param {any} data - The data containing the visual items.
 * @returns {string | null} - The ID of the thumbnail visual item, or null if not found.
 */
export function getThumbnailVisualItem(data: any): string | null {
  if (!data?.representation) {
    return null;
  }

  const visualItem = data.representation.find((item: any) =>
    item.digitally_shown_by.some((digitalObject: any) =>
      digitalObject.classified_as.some((classification: any) =>
        classification._label === "Thumbnails"
      )
    )
  );

  if (visualItem) {
    const digitalObject = visualItem.digitally_shown_by.find((obj: any) =>
      obj.classified_as.some((classification: any) =>
        classification._label === "Thumbnails"
      )
    );

    if (digitalObject?.access_point?.length > 0) {
      return digitalObject.access_point[0].id;
    }
  }

  return null;
}
