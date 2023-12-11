import Flow from '@/components/flow'
import { SanityImageAssetDocument, groq } from 'next-sanity'
import { Suspense } from 'react'

export interface GraphProps {
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

export const query = groq`{
  'nodes': [
    ...*[_type in ['Software'] && defined(hasSoftwarePart)] | order(label asc)  {
      "id": _id,
      "data": {
        "type": _type,
        label,
      },
    },
    ...*[_type in ['VolatileSoftware'] && (defined(designatedAccessPoint) || defined(uses) || defined(hostedBy) || defined(runBy))] | order(label asc)  {
      "id": _id,
      "data": {
        "type": _type,
        label,
      },
    },
    ...*[_type in ['SoftwareComputingEService'] && (defined(designatedAccessPoint) || defined(accessPoint))] | order(label asc)  {
      "id": _id,
      "data": {
        "type": _type,
        label,
      },
    },
    ...*[_type in ['AccessPoint']] | order(label asc)  {
      "id": _id,
      "data": {
        "type": _type,
        "label": coalesce(
          label,
          value,
        ),
      },
    }
  ],
  'edges': [
    ...*[_type in ['Software'] && defined(hasSoftwarePart)] {
      "edges": hasSoftwarePart[]-> {
        "id":  ^._id + '_' + _id,
        "source":  ^._id,
        "target":  _id,
      }
    },
    ...*[_type in ['VolatileSoftware'] && defined(runBy)] {
      "edges": runBy[]-> {
        "id":  ^._id + '_' + _id,
        "source":  ^._id,
        "target":  _id,
      }
    },
    ...*[_type in ['VolatileSoftware'] && defined(uses)] {
      "edges": uses[]-> {
        "id":  ^._id + '_' + _id,
        "source":  ^._id,
        "target":  _id,
      }
    },
    ...*[_type in ['VolatileSoftware'] && defined(hostedBy)] {
      "edges": hostedBy[]->.designatedAccessPoint-> {
        "id":  ^._id + '_' + _id,
        "source":  ^._id,
        "target":  _id,
      }
    },
    *[_type in ['VolatileSoftware', 'HostingService', 'SoftwareComputingEService'] && defined(designatedAccessPoint)] {
      "edges": designatedAccessPoint-> {
        "id":  ^._id + '_' + _id,
        "source":  ^._id,
        "target":  _id,
      }
    },
    ...*[_type in ['SoftwareComputingEService'] && defined(accessPoint)] {
      "edges": accessPoint[]-> {
        "id":  ^._id + '_' + _id,
        "source":  ^._id,
        "target":  _id,
      }
    },
  ]
}`

const Graph = ({ data }: { data: any }) => {
  const { nodes, edges } = data

  const flatEdges = [
    ...edges.reduce((acc: any, curr: any) => {
      return [...acc, ...curr.edges ?? []]
    }, [])
  ]

  return (
    <div className='w-full h-screen border border-red-400'>
      <Suspense fallback={<div>Loading...</div>}>
        <Flow nodes={nodes} edges={flatEdges} />
      </Suspense>
    </div>
  )
}

export default Graph
