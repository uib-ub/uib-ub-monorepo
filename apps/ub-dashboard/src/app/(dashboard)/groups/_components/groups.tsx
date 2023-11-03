import { groq } from 'next-sanity'
import { DataTable } from '@/components/data-table'
import { columns } from './table/columns'

export interface GroupProps {
  id: string
  type: string
  label: string
  hasType: {
    id: string
    label: string
  }[]
  period: string
  image: string
  shortDescription: string
  memberOf: string[]
  active: string
}

export const query = groq`*[_type in ['Group']] | order(active) | order(label asc)  {
  "id": _id,
  "type": _type,
  label,
  hasType[]-> {
    "id": _id,
    label,
  },
  image,
  shortDescription,
  "period": timespan.edtf,
  "active": "Aktiv",
  !defined(timespan) => {
    "active": "Ukjent" 
  },
  timespan.endOfTheEnd != '' && timespan.endOfTheEnd <= now() => {
    "active": "Avsluttet" 
  },
}`

const Groups = ({ data }: { data: GroupProps[] }) => {

  return (
    <DataTable
      data={data}
      columns={columns}
      config={{
        labelSearch: true,
        activeFilter: true,
      }}
    />
  )
}

export default Groups