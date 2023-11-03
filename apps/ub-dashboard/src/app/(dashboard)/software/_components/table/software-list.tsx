import { SanityImageAssetDocument, groq } from 'next-sanity'
import { DataTable } from '@/components/data-table'
import { columns } from './columns'

export interface SoftwareListProps {
  id: string
  type: string
  label: string
  logo: SanityImageAssetDocument
  hasType: {
    id: string
    label: string
  }[]
  madeByUB: boolean
  image: string
  shortDescription: string
  memberOf: string[]
  active: string
  hostedBy: string[]
  runBy: string[]
}

export const query = groq`*[_type in ['Software']] | order(label asc)  {
  ...,
  "id": _id,
  "type": _type,
  "label": label,
  logo,
  hasType[]-> {
    "id": _id,
    label
  },
  externalSoftware == null => {
    "madeByUB": true,
  },
  externalSoftware == false => {
    "madeByUB": true,
  },
  externalSoftware == true => {
    "madeByUB": false,
  },
  "period": timespan.edtf,
  "active": "Aktiv",
  !defined(timespan) => {
    "active": "Ukjent" 
  },
  timespan.endOfTheEnd != '' && timespan.endOfTheEnd <= now() => {
    "active": "Avsluttet" 
  },
  "hostedBy": hasSoftwarePart[]->.hostedBy[]->.componentOf->.label,
  "runBy": hasSoftwarePart[]->.runBy[]->.providedBy->.label
}`

const SoftwareList = ({ data }: { data: SoftwareListProps[] }) => {
  return (
    <DataTable
      data={data}
      columns={columns}
      config={{
        labelSearch: true,
        activeFilter: false,
        externalSoftwareFilter: true,
      }}
    />
  )
}

export default SoftwareList