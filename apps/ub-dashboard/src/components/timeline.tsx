import { groupBy, sortBy } from 'lodash'
import { Alert, AlertTitle } from './ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { TimelineProps } from '@/types'
import { MdDeleteForever, MdEvent, MdEventAvailable, MdGroup, MdGroupAdd, MdGroupRemove, MdTransferWithinAStation } from 'react-icons/md'
import { dateToString } from './date'
import Link from 'next/link'
import { path } from '@/lib/utils'
import { GoMoveToEnd, GoMoveToStart, GoProject } from 'react-icons/go'
import { GiStarFormation } from 'react-icons/gi'
import { Badge } from './ui/badge'

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

  const icon: { [key: string]: JSX.Element } = {
    ['Joining']: <MdGroupAdd className="w-6 h-6 mr-2" />,
    ['Leaving']: <MdGroupRemove className="w-6 h-6 mr-2" />,
    ['Event']: <MdEvent className="w-6 h-6 mr-2" />,
    ['Group']: <MdGroup className="w-6 h-6 mr-2" />,
    ['Project']: <GoProject className="w-6 h-6 mr-2" />,
    ['Activity']: <MdEventAvailable className="w-6 h-6 mr-2" />,
    ['TransferOfMember']: <MdTransferWithinAStation className="w-6 h-6 mr-2" />,
    ['EndOfExistence']: <GoMoveToEnd className="w-6 h-6 mr-2" />,
    ['BeginningOfExistence']: <GoMoveToStart className="w-6 h-6 mr-2" />,
    ['Formation']: <GiStarFormation className="w-6 h-6 mr-2" />,
    ['Dissolution']: <MdDeleteForever className="w-6 h-6 mr-2" />,
  }

  return (
    <ol className="relative border-l border-gray-200 dark:border-gray-700">
      {groupedByYear && Object.entries(groupedByYear).reverse().map(([key, value]: [string, any]) => (
        <li key={key} className="mb-10 ml-4">
          <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-3.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
          <time className="text-4xl font-extrabold leading-none text-muted-foreground">{key}</time>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3'>
            {value.map((item: TimelineProps) => (
              <Card key={item.id} className="flex flex-col p-0 rounded-sm">
                <CardHeader className='p-3'>
                  <CardDescription className='flex gap-1 text-lg'>
                    {dateToString(item.timestamp)}
                  </CardDescription>
                  <CardTitle className='flex gap-1 text-lg'>
                    {icon[item.type]}
                    {path[item.type] !== undefined ? (
                      <Link className='underline underline-offset-2' href={`/${path[item.type]}/${item.id}`}>
                        {item.label}
                      </Link>
                    ) : item.label}
                  </CardTitle>
                </CardHeader>
                {item.connectedTo && item.connectedTo.length > 0 ? (
                  <CardContent className='flex-grow px-3 py-0 pb-2'>
                    <h3 className='text-sm font-normal'>Knyttet til:</h3>
                    <div className='flex flex-col gap-1'>
                      {item.connectedTo.map((item: any) => (
                        <Link key={item.id} className='text-sm text-muted-foreground underline underline-offset-2' href={`/${path[item.type]}/${item.id}`}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </CardContent>) : null}
                <CardFooter className='px-3 py-2 text-sm text-muted-foreground border-t flex justify-between mt-auto'>
                  <div className='flex flex-col md:flex-row gap-2'>
                    {item.hasType && item.hasType.map((item: any) => (
                      <Badge variant={'secondary'} key={item.id}>
                        {item.label}
                      </Badge>
                    ))}
                  </div>
                  <div>
                    {item.type} ({item.period})
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </li>
      ))}
    </ol>
  )
}

export default Timeline
