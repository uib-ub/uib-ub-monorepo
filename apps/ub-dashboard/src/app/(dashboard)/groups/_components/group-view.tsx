"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn, path } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'

const bgColors: Record<string, string> = {
  "Universitet": "bg-zinc-50",
  "Universitetsbibliotek": "bg-zinc-100",
  "Fakultet": "bg-zinc-100",
  "Avdeling": "bg-zinc-100",
  "Seksjon": "bg-zinc-200",
  "Institutt": "bg-zinc-200",
  "Faggruppe": "bg-zinc-300",
  "Bibliotek": "bg-zinc-300",
  "Fokusgruppe": "bg-zinc-400",
  "Arbeidsgruppe": "bg-zinc-400",
}

const borderColors: Record<string, string> = {
  "Universitet": "bg-zinc-400",
  "Universitetsbibliotek": "bg-zinc-500",
  "Fakultet": "bg-zinc-500",
  "Avdeling": "bg-zinc-500",
  "Seksjon": "bg-zink-600",
  "Institutt": "bg-zinc-600",
  "Faggruppe": "bg-zinc-700",
  "Bibliotek": "bg-zinc-700",
  "Fokusgruppe": "bg-zinc-800",
  "Arbeidsgruppe": "bg-zinc-800",
}

const bgDarkColors: Record<string, string> = {
  "Universitet": "dark:bg-zinc-900",
  "Universitetsbibliotek": "dark:bg-zinc-800",
  "Fakultet": "dark:bg-zinc-800",
  "Avdeling": "dark:bg-zinc-800",
  "Seksjon": "dark:bg-zinc-700",
  "Institutt": "dark:bg-zinc-700",
  "Faggruppe": "dark:bg-zinc-600",
  "Bibliotek": "dark:bg-zinc-600",
  "Fokusgruppe": "dark:bg-zinc-500",
  "Arbeidsgruppe": "dark:bg-zinc-500",
}

export const GroupCategories = ({ data }: { data: any }) => {
  const [activeFilter, setActiveFilter] = useState(true)
  const handleActiveFilter = () => {
    setActiveFilter(!activeFilter)
  }

  return (
    <>
      <Button onClick={() => handleActiveFilter()}>{activeFilter ? 'Vis alle' : 'Vis aktive'}</Button>
      {data && Object.entries(data).map(([key, value]: [string, any]) => (
        <div id={key} key={key}>
          <h2 className='mb-2 text-2xl font-light text-zinc-700 dark:text-zinc-400'>{key}</h2>
          <GroupView data={value} showActive={activeFilter} />
        </div>
      ))}
    </>
  )
}

const GroupView = ({ data, showActive }: { data: any, showActive: boolean }) => {
  return (
    <div className='flex flex-col gap-10'>
      {data.filter((f: any) => { return showActive ? f.active == 'Aktiv' : f }).map((node: any) => (
        <GroupViewItem data={node} key={node.id} showActive={showActive} />
      ))}
    </div>
  )
}

const GroupViewItem = ({ data, showActive, className }: { data: any, showActive: boolean, className?: string }) => {
  return (
    <Card className={cn(`flex flex-col gap-1 border rounded-sm p-0`, className, bgColors[data.hasType[0].label], bgDarkColors[data.hasType[0].label])} key={data.id}>
      <CardHeader className='flex gap-1 p-4'>
        <CardTitle>
          <Link href={`/${path[data.type]}/${data.id}`} className='underline underline-offset-2'>
            {data.label}
          </Link>
        </CardTitle>
        <CardDescription className='mix-blend-difference'>{data.shortDescription}</CardDescription>

        <Separator className={cn('my-3', borderColors[data.hasType[0].label])} />

        <div className='flex gap-3'>
          {data?.hasType ? (
            <Card className='border-0 p-0 shadow-none bg-transparent'>
              <CardHeader className='p-0'>
                <CardTitle className='text-sm'>Type</CardTitle>
              </CardHeader>
              <CardContent className='p-0 flex flex-wrap gap-1'>{data.hasType.map((tag: any) => (
                <Badge key={tag.id} variant={'outline'} className='border-none py-1 px-0'>{tag.label}</Badge>
              ))}
              </CardContent>
            </Card>
          ) : null}
          {data?.period ? (
            <Card className='border-0 p-0 shadow-none bg-transparent'>
              <CardHeader className='p-0'>
                <CardTitle className='text-sm'>Periode</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>{data.period}</CardContent>
            </Card>
          ) : null}
        </div>
        <Separator className={cn('my-3', borderColors[data.hasType[0].label])} />
      </CardHeader>

      {data?.hasMember?.length > 0 || data?.children?.length > 0 ? (
        <CardContent className='flex flex-col gap-4 p-4'>
          {/* Add a list with group members */}
          {data.hasMember ? (
            <>
              <div className='font-bold text-xl'>Medlemmer:</div>
              <ul className='columns-1 lg:columns-2 xl:columns-3'>
                {data.hasMember.map((member: any, index: number) => (
                  <li key={data.id + member.id + index}>
                    <h4>
                      <Link className='underline underline-offset-2' href={`/persons/${member.id}`}>
                        {member.label}
                      </Link>
                      {(member.timespan !== null && (member.role !== null && member.role?.length > 0)) ? ` (${member.role.join(', ')}, ${member.timespan})` : null}
                      {(member.timespan !== null && (member.role !== null && member.role?.length === 0)) ? ` (${member.timespan})` : null}
                      {(member.timespan === null && (member.role !== null && member.role?.length > 0)) ? ` (${member.role.join(', ')})` : null}
                    </h4>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {data?.children.filter((f: any) => { return showActive ? f.active == 'Aktiv' : f }).map((child: any) => (
            <GroupViewItem key={child.id} data={child} showActive={showActive} />
          ))}

        </CardContent>
      ) : null}
    </Card>
  )
}
