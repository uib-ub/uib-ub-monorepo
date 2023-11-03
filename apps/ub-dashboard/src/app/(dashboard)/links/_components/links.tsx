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

export const query = groq`*[_type in ['Endpoint', 'AccessPoint', 'HostingService', 'SoftwareComputingEService'] && (defined(designatedAccessPoint) || defined(url) || defined(value))] | order(active) | order(label asc)  {
  "id": _id,
  "type": _type,
  label,
  hasType[]-> {
    "id": _id,
    label,
  },
  "url": coalesce(    
    url,
    value,
    designatedAccessPoint.value,
    "http://no-url.no"
  ),
  "period": timespan.edtf,
  "active": "Aktiv",
  !defined(timespan) => {
    "active": "Ukjent" 
  },
  timespan.endOfTheEnd != '' && timespan.endOfTheEnd <= now() => {
    "active": "Avsluttet" 
  },
}`

export const accessPointQuery = groq`*[_type in ['SoftwareComputingEService']] {
  defined(accessPoint) => {
    accessPoint[] {
      "id": ^._id,
      "type": ^._type,
      "label": ^.label,
      "url": coalesce(
        url,
        value,
        "http://no-url.no"
      ),
      "period": ^.timespan.edtf,
      "active": "Aktiv", 
      !defined(^.timespan) => {
        "active": "Ukjent" 
      },
      ^.timespan.endOfTheEnd != '' && ^.timespan.endOfTheEnd <= now() => {
        "active": "Avsluttet" 
      },
    }
  }
}`

const Links = ({ data }: { data: LinksProps[] }) => {

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

export default Links