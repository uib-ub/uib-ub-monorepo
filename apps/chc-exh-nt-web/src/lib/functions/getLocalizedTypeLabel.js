const getLocalizedTypeLabel = (value) => {
  if (!value) return null

  switch (value) {
    case 'Production':
      return {
        no: 'Produksjon',
        en: value
      }
      break;
    case 'BeginningOfExistence':
      return {
        no: 'Skapelse',
        en: 'Creation'
      }
      break;
  }
}

export default getLocalizedTypeLabel