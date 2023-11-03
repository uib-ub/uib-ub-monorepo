"use client"

import { DataTable } from '@/components/data-table'
import Link from 'next/link';
import { path } from '@/lib/utils';
import { ClockIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { GiFinishLine } from 'react-icons/gi';
import { Alert, AlertTitle } from './ui/alert';

const columns = [
  {
    header: "Navn",
    accessorKey: "label",
    cell: ({ row }: { row: any }) => (
      <div className='w-[200px]'>
        <Link href={`/${path[row.getValue('type')]}/${row.original.id}`} className='font-bold'>
          {row.getValue('label')}
        </Link>
      </div>
    ),
  },
  {
    header: "Type",
    accessorKey: "type",
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


export const ResultedIn = ({ data, config = { activeFilter: true } }: { data: any, config?: any }) => {
  return (
    <>
      {data ? (<DataTable columns={columns} data={data} config={config} />) : <Alert><AlertTitle>Ingen resultat registrert</AlertTitle></Alert>}
    </>
  )
}