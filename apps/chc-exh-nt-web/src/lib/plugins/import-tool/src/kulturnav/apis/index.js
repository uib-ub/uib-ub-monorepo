import { nanoid } from 'nanoid'
import { getDocument } from './getDocument'
import { useClient } from 'sanity'


const createDoc = async (doc, importTo) => {
  const client = useClient.withConfig({ apiVersion: '2021-03-25' })
  if (!doc) return { success: false }

  let importDoc = doc

  if (importTo) {
    importDoc._type = importTo
  }

  const transaction = client.transaction()
  transaction.createOrReplace(importDoc)
  transaction
    .commit()
    .then((res) => {
      console.log(JSON.stringify(res, null, 2))
      return res
    })
    .catch((err) => {
      console.log('Transaction failed', err)
      return err
    })
}

export const chooseItem = async (item, importTo) => {
  const doc = getDocument(item)
  // console.log(importTo)
  /* TODO
    Important to include iiif manifest in asset metadata as the asset could be reused else where in the dataset */
  /* const assetMeta = {
    source: {
      // The source this image is from
      name: 'nb.no',
      url: item._links.presentation.href,
      // A string that uniquely idenitfies it within the source.
      // In this example the URL is the closest thing we have as an actual ID.
      id: item.id,
    },
    description: item.metadata.title,
    creditLine: 'From nb.no',
  } */

  try {
    /* const imageResonse = await getImageBlob(customImageSize(imageUrl))
    const asset = await uploadImageBlob(imageResonse)
    await patchAssetMeta(asset._id, assetMeta) */

    await createDoc(doc, importTo)
    /* if (asset && document) {
      await setAssetRef(document._id, asset._id)
    } */

    return {
      success: true,
    }
  } catch (err) {
    return {
      success: false,
    }
  }
}
