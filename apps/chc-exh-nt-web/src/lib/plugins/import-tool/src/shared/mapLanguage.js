export const mapLanguage = (lang) => {
  let mappedLanguage

  switch (lang) {
    case 'no':
      mappedLanguage = '57f069ef-d0be-49c2-85f9-7ff5c6ce8161'
      break
    case 'en':
      mappedLanguage = '40b36690-50b4-4c09-a25d-d62d5fba3d8a'
      break
    /* case 'nb':
      mappedLanguage = '6c7b4d8d-c73b-48be-a60a-0b8803f71342'
      break
    case 'nn':
      mappedLanguage = 'e10cbbaf-bc4d-41cd-956c-e3cbed6008d4'
      break
    case 'sv':
      mappedLanguage = '034ada4b-fcb0-4039-9c3d-9edc6edc9db7'
      break
    case 'fi':
      mappedLanguage = '2443edca-1f54-4c41-abcb-ad448206e873'
      break
    case 'es':
      mappedLanguage = 'fe989d5b-136b-4632-9e28-f0901bf36bb6'
      break
    case 'dk':
      mappedLanguage = '0e859bea-cccd-46c5-a584-ef0e50b350ee'
      break */
    default:
      mappedLanguage = '57f069ef-d0be-49c2-85f9-7ff5c6ce8161'
      break
  }

  return mappedLanguage
}
