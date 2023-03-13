/**
 * Helper function to return the correct version of the document
 * If we're in "preview mode" and have multiple documents, return the draft
 */
export const filterDataToSingleItem = (data: any, preview: boolean) => {
  //console.log(JSON.stringify(data, null, 2))
  if (!Array.isArray(data)) {
    return data
  }

  if (data.length === 1) {
    return data[0]
  }

  if (preview) {
    return data.find((item) => item._id.startsWith(`drafts.`)) || data[0]
  }

  return data[0]
}