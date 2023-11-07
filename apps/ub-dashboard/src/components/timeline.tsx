import { groupBy, sortBy } from 'lodash'
import { groq } from 'next-sanity'
import { Alert, AlertTitle } from './ui/alert'

export type TimelineProps = {
  id: string
  type: string
  label: string
  period: string
  connectedTo: {
    id: string
    type: string
    label: string
  }
  timestamp: string
}

export const query = groq`[
  ...*[_type in ['Event', 'Activity', 'Move', 'Joining', 'Leaving', 'BeginningOfExistence', 'EndOfExistence', 'Formation', 'Dissolution', 'TransferOfMember'] && defined(timespan)] {
    "id": _id,
    "label": coalesce(label, 'Uten label'),
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
  ...*[_type in ['Project'] && defined(timespan.endOfTheEnd)] {
      ...select(defined(timespan.endOfTheEnd) => {
        "id": _id,
        "type": _type,
        "label": label + " avsluttes",
        "period": timespan.edtf,
        "timestamp": timespan.endOfTheEnd,
      }
    )
  },
  ...*[_type in ['Project'] && defined(timespan.beginOfTheBegin)] {
      ...select(defined(timespan.beginOfTheBegin) => {
        "id": _id,
        "type": _type,
        "label": label + " starter",
        "period": timespan.edtf,
        "timestamp": timespan.beginOfTheBegin,
      }
    )
  }
]`

const Timeline = ({ data }: { data: TimelineProps[] }) => {
  if (data.length === 0) return (
    <Alert>
      <AlertTitle>
        Ikke nok informasjon...
      </AlertTitle>
    </Alert>
  )

  const sortedByYear = sortBy(data, ['timestamp'])
  const groupedByYear = groupBy(sortedByYear, function (item) {
    if (!item.timestamp) return 'Udatert'
    return item.timestamp.substring(0, 4);
  })

  return (
    <ol className="relative border-l border-gray-200 dark:border-gray-700 my-4">
      {groupedByYear && Object.entries(groupedByYear).reverse().map(([key, value]: [string, any]) => (
        <li key={key} className="mb-10 ml-4">
          <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-3.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
          <time className="mb-3 text-4xl font-extrabold leading-none text-gray-500 dark:text-gray-400">{key}</time>
          {value.map((item: TimelineProps) => (
            <div key={item.id} className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.label}</h3>
              <p className="text-base font-normal text-gray-500 dark:text-gray-400">{item.period}</p>
            </div>
          ))}
        </li>
      ))}
    </ol>
  )
}

export default Timeline