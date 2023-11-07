"use client"

import { CaretSortIcon, ClockIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import { ColumnDef } from "@tanstack/react-table"
import { LinksProps } from '../links'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { GiFinishLine } from 'react-icons/gi'

export const columns: ColumnDef<LinksProps>[] = [
  {
    accessorKey: "url",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className='p-1'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Lenke
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Link href={row.getValue('url')} className='font-bold'>
        {row.getValue('url')}
      </Link>
    )
  },
  {
    accessorKey: "label",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className='p-1'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Navn
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    header: "Type",
    accessorKey: "type",
  },
  {
    header: "Kategori",
    accessorKey: "hasType",
    cell: ({ row }: { row: any }) => (
      <div className='flex flex-col gap-2'>
        {row.getValue('hasType')?.map((t: any, i: number) => (
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
]
