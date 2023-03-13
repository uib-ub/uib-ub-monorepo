export const mapLicenses = (license) => {
  let mappedLicense

  switch (license) {
    case 'CC BY':
    case 'CC BY 3.0':
    case 'CC BY 4.0':
      mappedLicense = 'https://creativecommons.org/licenses/by/4.0'
      break
    case 'CC BY-SA':
    case 'CC BY-SA 3.0':
    case 'CC BY-SA 4.0':
      mappedLicense = 'https://creativecommons.org/licenses/by-sa/4.0'
      break
    case 'CC BY-ND':
    case 'CC BY-ND 3.0':
    case 'CC BY-ND 4.0':
      mappedLicense = 'https://creativecommons.org/licenses/by-nd/4.0'
      break
    case 'CC BY-NC':
    case 'CC BY-NC 3.0':
    case 'CC BY-NC 4.0':
      mappedLicense = 'https://creativecommons.org/licenses/by-nc/4.0'
      break
    case 'CC BY-SA':
    case 'CC BY-SA 3.0':
    case 'CC BY-SA 4.0':
      mappedLicense = 'https://creativecommons.org/licenses/by-sa/4.0'
      break
    case 'CC BY-NC-SA':
    case 'CC BY-NC-SA 3.0':
    case 'CC BY-NC-SA 4.0':
      mappedLicense = 'https://creativecommons.org/licenses/by-nc-sa/4.0'
      break
    case 'CC BY-NC-ND':
    case 'CC BY-NC-ND 3.0':
    case 'CC BY-NC-ND 4.0':
      mappedLicense = 'https://creativecommons.org/licenses/by-nc-nd/4.0'
      break
    case 'PDM':
      mappedLicense = 'https://creativecommons.org/publicdomain/mark/1.0/'
      break
    default:
      mappedLicense = 'https://rightsstatements.org/vocab/CNE/1.0/'
      break
  }

  return mappedLicense
}
