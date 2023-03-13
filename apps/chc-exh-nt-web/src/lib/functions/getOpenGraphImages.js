import { urlFor } from '../sanity'

export const getOpenGraphImages = (openGraphImage, title) => {
  if (!openGraphImage) {
    return null
  }

  return [
    {
      url: urlFor(openGraphImage).width(800).height(600).url(),
      width: 800,
      height: 600,
      alt: title,
    },
    {
      // Facebook recommended size
      url: urlFor(openGraphImage).width(1200).height(630).url(),
      width: 1200,
      height: 630,
      alt: title,
    },
    {
      // Square 1:1
      url: urlFor(openGraphImage).width(600).height(600).url(),
      width: 600,
      height: 600,
      alt: title,
    },
  ]
}
