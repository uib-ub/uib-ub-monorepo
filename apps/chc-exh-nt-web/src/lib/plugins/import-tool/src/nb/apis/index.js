import { getDocument } from './getDocument'
import { getImageBlob, patchAssetMeta, setAssetRef, uploadImageBlob } from '../../shared/storeFunctions'
import { getCustomImageSizeFromNB } from './getCustomImageSizeFromNB'
import { useClient } from 'sanity'


export const chooseItem = async (item) => {
  const imageUrl = item._links.thumbnail_custom.href

  /* TODO Use richer data if we want actors. Example MODS: https://api.nb.no/catalog/v1/metadata/ab988935135a703a880eb56c4fc7a13e/mods */

  const assetMeta = {
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
  }

  const createDoc = async (doc) => {
    const client = useClient.withConfig({ apiVersion: '2021-03-25' })
    const res = client.createIfNotExists(doc).then((result) => {
      console.log(`${result._id} was imported!`)
      return result
    })
    return res
  }

  try {
    // Prepare json conforming to the Muna schema
    const doc = await getDocument(item)

    // Get a custom sized thumbnail from NB and create a blob
    const imageResonse = await getImageBlob(getCustomImageSizeFromNB(imageUrl))
    // Upload asset blog
    const asset = await uploadImageBlob(imageResonse, item.id)
    // Add metadata to asset
    await patchAssetMeta(asset._id, assetMeta)

    const document = await createDoc(doc)

    if (asset && document) {
      await setAssetRef(document._id, asset._id)
    }

    // TODO This is horrible
    return {
      success: true,
      body: JSON.stringify(document, asset),
    }
  } catch (err) {
    return {
      success: false,
      body: JSON.stringify(err),
    }
  }
}
