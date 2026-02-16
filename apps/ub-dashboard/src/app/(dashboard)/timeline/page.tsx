import Timeline from '@/components/timeline'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/shared/main-shell'
import { groq } from 'next-sanity'

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

export default async function TimelinePage() {
  const { data } = await sanityFetch({ query })

  return (
    <MainShell>
      <h1 className='mb-6'>Tidslinje</h1>
      <Timeline data={data.timeline} />
    </MainShell>
  );
}