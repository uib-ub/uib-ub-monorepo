"use client"

import { CheckHttpStatus } from '@/components/check-http-status'
import { LoadingSpinner } from '@/components/loaders/loading-spinner'
import { Button } from '@/components/ui/button'
import { CaretSortIcon, ClockIcon, TrashIcon } from "@radix-ui/react-icons"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Suspense } from 'react'
import { GiFinishLine } from 'react-icons/gi'
import { LinksProps } from '../links'

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
      <Link href={row.getValue('url')} className={`font-bold ${(row.getValue('status') as string) === 'deleted' ? 'text-muted-foreground' : ''}`} target='_blank'>
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
    header: "Brukes av",
    accessorKey: "usedBy",
    cell: ({ row }: { row: any }) => (
      <div className='flex flex-col gap-2'>
        {row.getValue('usedBy')?.map((t: any, i: number) => (
          <div key={i}>
            {t.label}
          </div>
        ))}
      </div>
    )
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }: { row: any }) => (
      <div className='flex flex-wrap gap-2'>
        {(row.getValue('status') as string) === 'active' ? <div className='flex gap-1 items-center'><ClockIcon className='text-blue-500 w-5 h-5' />{row.getValue('status')}</div> : null}
        {(row.getValue('status') as string) === 'archive' ? <div className='flex gap-1 items-center'><GiFinishLine className='text-green-500 w-5 h-5' />{row.getValue('status')}</div> : null}
        {(row.getValue('status') as string) === 'deleted' ? <div className='flex gap-1 items-center'><TrashIcon className='text-red-500 w-5 h-5' />{row.getValue('status')}</div> : null}
      </div>
    )
  },
  {
    header: "Online?",
    //accessorKey: "url",
    cell: ({ row }: { row: any }) => (
      <Suspense fallback={<LoadingSpinner />}>
        {row.getValue('status') as string == 'deleted'
          ? <CheckHttpStatus url={row.getValue('url')} />
          : null
        }
      </Suspense>
    )
  },
]
