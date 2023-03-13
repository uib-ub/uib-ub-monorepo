const normalizedString = (dirtyLabel) => {
  // If we only get a string, assume that it is in norwegian
  if (typeof dirtyLabel === 'string') {
    return {
      no: [dirtyLabel],
      en: [dirtyLabel],
    }
  }
  // If it is an array, we have multiple labels. It could be two strings and then 
  // we assume they are in norwegian. If we get objects we need to map the language.
  // We could get an array with both strings and objects :-(!!!!
  if (Array.isArray(dirtyLabel)) {
    const labels = {
    }
    dirtyLabel.map((i) => {
      if (i && typeof i === 'object') {
        Object.assign(labels, { [i['@language']]: [i.value] })
      }
      if (i && typeof i === 'string') {
        Object.assign(labels, { no: [i] })
      }
    })
    return labels
  }

  if (typeof dirtyLabel === 'object' && dirtyLabel !== null) {
    return {
      [dirtyLabel['@language']]: [dirtyLabel.value]
    }
  }
}

export default normalizedString