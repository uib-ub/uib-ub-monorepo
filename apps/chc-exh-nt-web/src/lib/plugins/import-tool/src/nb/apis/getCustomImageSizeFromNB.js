export function getCustomImageSizeFromNB(image, h = 0, w = 900) {
  // Asking for images larger than 999 will de denied
  if (!image) {
    console.error('No image url to fetch!')
    throw Error
  }

  const template = image.replace('{height}', h).replace('{width}', w)
  return template
}