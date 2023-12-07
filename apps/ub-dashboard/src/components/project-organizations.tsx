"use client"

import { Button } from '@/components/ui/button'
import { CaretSortIcon, ClockIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { GiFinishLine } from 'react-icons/gi';
import { Alert, AlertTitle } from './ui/alert';
import { ContributionAssignmentProps } from '@/types';

const columns = [
  {
    accessorKey: "assignedActor",
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Navn
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }: { row: any }) => (
      <div className='w-[200px]'>
        <Link href={`/persons/${row.getValue('assignedActor').id}`} className='font-bold'>
          {row.getValue('assignedActor').label}
        </Link>
      </div>
    ),
  },
  {
    header: "Rolle",
    accessorKey: "assignedRole",
    cell: ({ row }: { row: any }) => (
      <div className='flex flex-col gap-2'>
        {row.getValue('assignedRole')?.map((t: any, i: number) => (
          <div key={i}>
            {t.label}
          </div>
        ))}

      </div>
    )
  },
  {
    header: "Periode",
    accessorKey: "period",
    cell: ({ row }: { row: any }) => (
      <span className='whitespace-nowrap'>
        {row.getValue('period')}
      </span>
    )
  },
  {
    header: "Status",
    accessorKey: "active",
    cell: ({ row }: { row: any }) => (
      <div className='flex flex-wrap gap-2'>
        {(row.getValue('active') as string) === 'Aktiv' ? <div className='flex gap-1 items-center'><ClockIcon className='text-blue-500 w-5 h-5' />{row.getValue('active')}</div> : null}
        {(row.getValue('active') as string) === 'Avsluttet' ? <div className='flex gap-1 items-center'><GiFinishLine className='text-green-500 w-5 h-5' />{row.getValue('active')}</div> : null}
        {(row.getValue('active') as string) === 'Ukjent' ? <div className='flex gap-1 items-center'><QuestionMarkCircledIcon className='text-amber-500 w-5 h-5' />{row.getValue('active')}</div> : null}
      </div>
    )
  },
];

export const ProjectOrganizations = ({ data }: { data: ContributionAssignmentProps[] }) => {
  return (
    <>
      {data ? (
        <div className='flex flex-col gap-4'>
          {data.map((item: any, i: number) => (
            <div key={i}>
              <Link className='underline underline-offset-2' href={`/groups/${item.assignedActor.id}`}>{item.assignedActor.label}</Link>
            </div>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertTitle>Ingen medlemmer registrert</AlertTitle>
        </Alert>
      )}
    </>
  )
}