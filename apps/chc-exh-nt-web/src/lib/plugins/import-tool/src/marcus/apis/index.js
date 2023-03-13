import { omit } from 'lodash'
import getDocument from './getDocument'
import { createDoc, getImageBlob, patchAssetMeta, uploadImageBlob } from '../../shared/storeFunctions'

export const getBaseUrl = () => {
  if (process.env.VERCEL_ENV === "production")
    return "https://api-ub.vercel.app";
  if (process.env.VERCEL_ENV === "preview")
    return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3009";
};

export const chooseItem = async (item) => {
  const response = await fetch(`${getBaseUrl()}/items/${item}`)

  // Deal with response
  if (response.status >= 200 && response.status <= 299) {
    const result = await response.json()

    // Remove json-ld context
    const cleanJSON = omit(result, ['@context'])
    console.log(cleanJSON)

    const imageResonse = await getImageBlob(cleanJSON.image)

    const asset = await uploadImageBlob(imageResonse, cleanJSON.identifier)

    // Get the Sanity document
    const doc = getDocument(cleanJSON, asset._id)
    await createDoc(doc)

    const assetMeta = {
      source: {
        // The source this image is from
        name: 'marcus.uib.no',
        url: doc.homepage || '',
        // A string that uniquely idenitfies it within the source.
        // In this example the URL is the closest thing we have as an actual ID.
        id: cleanJSON.identifier,
      },
      description: doc?.label?.[0].value,
      creditLine: 'From sparql.ub.uib.no',
    }
    await patchAssetMeta(asset._id, assetMeta)

    return {
      success: true,
      body: JSON.stringify(document, asset),
    }
  } else {
    return {
      success: false,
      body: JSON.stringify(response.status, response.statusText),
    }
  }
}
