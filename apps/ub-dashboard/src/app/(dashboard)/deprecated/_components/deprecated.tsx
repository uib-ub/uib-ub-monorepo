import { groq } from 'next-sanity'
import { DataTable } from '@/components/data-table'
import { columns } from './table/columns'

export interface DeprecatedProps {
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

export const query = groq`*[_type in ['Product', 'Service']] | order(active) | order(label asc)  {
  "id": _id,
  "type": _type,
  label,
  hasType[]-> {
    "id": _id,
    label,
  },
  "period": timespan.edtf,
}`


const Deprecated = ({ data }: { data: DeprecatedProps[] }) => {

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

export default Deprecated