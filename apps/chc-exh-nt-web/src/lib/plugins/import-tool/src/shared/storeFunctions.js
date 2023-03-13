import { getClient } from '../../../../sanity.server'

export const getImageBlob = async (url) => {
  // eslint-disable-next-line no-undef
  const response = fetch(url)
    .then((response) => response.body)
    .then((rs) => {
      const reader = rs.getReader()

      // eslint-disable-next-line no-undef
      return new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read()

            // When no more data needs to be consumed, break the reading
            if (done) {
              break
            }

            // Enqueue the next data chunk into our target stream
            controller.enqueue(value)
          }

          // Close the stream
          controller.close()
          reader.releaseLock()
        },
      })
    })
    // Create a new response out of the stream
    // eslint-disable-next-line no-undef
    .then((rs) => new Response(rs))
    // Create an object URL for the response
    .then((response) => response.blob())
  return response
}

export const uploadImageBlob = async (blob, filename) => {
  const res = getClient(false).assets
    .upload('image', blob, { contentType: blob.type, filename: `${filename}` })
    .then((document) => {
      console.log('The image was uploaded!', document)
      return document
    })
    .catch((error) => {
      console.error('Upload failed:', error.message)
    })
  return res
}

export const patchAssetMeta = async (id, meta) => {
  getClient(false)
    .patch(id)
    .set(meta)
    .commit()
    .then((document) => {
      console.log('The image was patched!', document)
    })
    .catch((error) => {
      console.error('Patch failed:', error.message)
    })
}

export const createDoc = async (docs) => {
  const transaction = getClient(false).transaction()
  const { doc, subject, technique, maker, depicts, spatial, skaAsOwner = [] } = docs

  //transaction.createIfNotExists(doc)
  transaction.createOrReplace(doc)

  const rest = [
    ...subject,
    ...technique,
    ...maker,
    ...depicts,
    ...spatial,
    ...skaAsOwner
  ]

  rest.forEach((arr) => {
    transaction.createOrReplace(arr)
  })

  transaction
    .commit()
    .then((res) => {
      console.log(JSON.stringify(res, null, 2))
    })
    .catch((err) => {
      console.error('Transaction failed: ', err.message)
    })
  return true
}

/* Not in use
 */
export const setAssetRef = async (docID, assetID) => {
  await getClient(false)
    .patch(docID)
    .set({
      image: {
        _type: 'DigitalImageObject',
        asset: {
          _type: 'reference',
          _ref: assetID,
        },
      },
    })
    .commit()
    .then((document) => {
      console.log('The asset was hooked up!', document)
    })
    .catch((error) => {
      console.error('Failed:', error.message)
    })
}
