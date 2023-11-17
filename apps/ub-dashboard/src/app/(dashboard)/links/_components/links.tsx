import { groq } from 'next-sanity'
import { DataTable } from '@/components/data-table'
import { columns } from './table/columns'

export interface LinksProps {
  id: string
  type: string
  label: string
  hasType: {
    id: string
    label: string
  }[]
  period: string
  url: string
  active: string
}

export const query = groq`*[_type in [ 'AccessPoint']] | order(value asc) {
  "id": _id,
  "type": _type,
  label,
  "url": value,
  "usedBy": *[references(^._id)]{
    "id": _id,
    "type": _type,
    label,
    status,
  }
}`

const Links = ({ data }: { data: LinksProps[] }) => {

  return (
    <DataTable
      data={data}
      columns={columns}
      config={{
        labelSearch: true,
        activeFilter: false,
      }}
    />
  )
}

export default Links