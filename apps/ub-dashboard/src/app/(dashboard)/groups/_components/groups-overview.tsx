import { groq } from 'next-sanity'
import { GroupCategories } from './group-view'
import { arrayToTree } from 'performant-array-to-tree'
import { groupBy } from 'lodash'
import Link from 'next/link'

export type GroupsOverviewProps = {
  id: string
  type: string
  label?: string
  hasType?: {
    id: string
    label: string
  }[]
  period?: string
  active?: string
  subGroupOf?: string[]
  hasMember?: {
    id: string
    label: string
    timespan: string
    role: string[]
  }[]
  image?: string
  shortDescription?: string
}

export const query = groq`*[_type in ['Group'] && !references('dd4c1492-5e15-4d18-a7f2-0b8b8f95964d')] | order(label asc)  {
  "id": _id,
  "type": _type,
  label,
  hasType[]-> {
    "id": _id,
    label,
  },
  "period": timespan.edtf,
  "active": "Aktiv",
  !defined(timespan) => {
    "active": "Ukjent" 
  },
  timespan.endOfTheEnd != '' && timespan.endOfTheEnd <= now() => {
    "active": "Avsluttet" 
  },
  "subGroupOf": [...subGroupOf[]->._id][0],
  "hasMember": hasMember[] {
    "id": assignedActor->._id,
    "label": assignedActor->.label,
    "timespan": timespan.edtf,
    "role": assignedRole[]->label,
  },
  image,
  shortDescription,
}`

const Groups = ({ data }: { data: GroupsOverviewProps[] }) => {
  const nestedData = arrayToTree(data, { parentId: 'subGroupOf', dataField: null })
  const groupedByType = groupBy(nestedData, function (item) {
    if (!item.hasType?.[0].label) return 'Uklassifisert'
    return item.hasType[0].label
  })

  return (
    <div className='flex gap-0 md:gap-10'>
      <div className='hidden md:block'>
        <div className='sticky top-2'>
          <div className='font-bold'>Kategorier</div>
          <div className='flex flex-col gap-2 mt-0 '>
            {groupedByType && Object.entries(groupedByType).map(([key, value]: [string, any]) => (
              <Link href={`#${key}`} key={key} className='text-zinc-500 dark:text-zinc-400'>{key}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-8'>
        <GroupCategories data={groupedByType} />
      </div>
    </div>
  )
}

export default Groups