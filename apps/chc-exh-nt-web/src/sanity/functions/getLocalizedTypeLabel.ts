const getLocalizedTypeLabel = (value: any) => {
  if (!value) return null

  switch (value) {
    case 'Production':
      return {
        no: 'Produksjon',
        en: value
      }
    case 'BeginningOfExistence':
      return {
        no: 'Skapelse',
        en: 'Creation'
      }
  }
}

export default getLocalizedTypeLabel