import { draftMode } from 'next/headers'
import { LiveQuery } from 'next-sanity/preview/live-query'
import Timeline from '@/components/timeline'
import PreviewTimeline from './_components/preview-timeline'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/shared/main-shell'
import { groq } from 'next-sanity'
import { TimelineProps } from '@/types'

const query = groq`{
  "timeline": [
    ...*[_type in ['Event', 'Activity', 'Move', 'Joining', 'Leaving', 'TransferOfMember', 'BeginningOfExistence', 'EndOfExistence', 'Formation', 'Dissolution'] && defined(timespan)] {
      "id": _id,
      "type": _type,
      "label": coalesce(label, 'Uten label'),
      hasType[]->{
        "id": _id,
        "label": label
      },
      "period": timespan.edtf,
      "timestamp": coalesce(
        select(
          timespan.date != "" => timespan.date
        ), 
        select(
          timespan.beginOfTheBegin != "" => timespan.beginOfTheBegin
        )
      )
    },
    ...*[_type in ['Project', 'Group'] && defined(timespan.endOfTheEnd)] {
        ...select(defined(timespan.endOfTheEnd) => {
          "id": _id,
          "type": _type,
          "label": label + " avsluttes",
          hasType[]->{
            "id": _id,
            "label": label
          },
          "period": timespan.edtf,
          "timestamp": timespan.endOfTheEnd,
          "connectedTo": *[_type == 'Project' && ^._id in hasTeam[]._ref] {
            "id": _id,
            "type": _type,         
            label
          }
        }
      )
    },
    ...*[_type in ['Project', 'Group'] && defined(timespan.beginOfTheBegin)] {
        ...select(defined(timespan.beginOfTheBegin) => {
          "id": _id,
          "type": _type,
          "label": label + " starter",
          hasType[]->{
            "id": _id,
            "label": label
          },
          "period": timespan.edtf,
          "timestamp": timespan.beginOfTheBegin,
          "connectedTo": *[_type == 'Project' && ^._id in hasTeam[]._ref] {
            "id": _id,
            "type": _type,         
            label
          }
        }
      )
    }
  ]
}`

type TimelinePageProps = {
  timeline: TimelineProps[]
}

export default async function TimelinePage() {
  const data = await sanityFetch<TimelinePageProps>({ query, revalidate: 7200 })

  return (
    <MainShell>
      <h1 className='mb-6'>Tidslinje</h1>
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        initialData={data.timeline}
        as={PreviewTimeline}
      >
        <Timeline data={data.timeline} />
      </LiveQuery>
    </MainShell>
  )
}