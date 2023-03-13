export const getID = `
  *[_id == $id] {
    ...,
    image {
      "_id": asset->url
    }
  }`

export const getDump = `
  *[!(_type in ["sanity.imageAsset", "Page", "LinguisticDocument", "Toc", "NavigationMenu"])] {
    ...,
    image {
      "_id": asset->url
    }
  }`
