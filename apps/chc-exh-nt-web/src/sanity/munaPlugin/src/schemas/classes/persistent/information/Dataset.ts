import { defineType } from 'sanity'
import { homepage, label, preferredIdentifier } from "../../../properties/datatype"

export default defineType({
  name: 'Dataset',
  type: 'object',
  title: 'Datasett',
  fields: [
    homepage,
    label,
    preferredIdentifier
  ],
})
