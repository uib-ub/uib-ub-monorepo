import { groq } from 'next-sanity'

export const depicts = groq`
depicts[]-> {
  _id,
  _type,
  label,
  image,
  definedBy,
}
`