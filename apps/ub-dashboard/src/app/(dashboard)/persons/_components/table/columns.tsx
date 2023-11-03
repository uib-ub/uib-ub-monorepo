"use client"
import { CaretSortIcon, ClockIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import { ColumnDef } from "@tanstack/react-table"
import { PersonListProps } from '../persons'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { EditIntentButton } from '@/components/edit-intent-button'
import { Badge } from '@/components/ui/badge'
import { GiFinishLine } from 'react-icons/gi'
import ImageBox from '@/components/image-box'

export const columns: ColumnDef<PersonListProps>[] = [
  {
    accessorKey: "label",
    header: ({ column }) => {
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
    cell: ({ row }) => (
      <div className='w-[200px] flex gap-2 items-center'>
        {row.original.image ? (
          <div className='w-[25px] h-[25px]'>
            <ImageBox image={row.original.image} width={45} height={45} alt="" classesWrapper='relative aspect-[1/1] rounded-full' />
          </div>
        ) : null}
        <Link href={`/persons/${row.getValue('id')}`} className='font-bold'>
          {row.getValue('label')}
        </Link>
      </div>
    )
  },
  {
    header: "Medlem av",
    accessorKey: "memberOf",
    cell: ({ row }) => (
      <div className='flex flex-wrap gap-2'>
        {(row.getValue('memberOf') as string[]).map((t: string, i: number) => (
          <Badge variant="secondary" className='grow-0' key={i}>
            {t}
          </Badge>
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
        {(row.getValue('active') as string) === 'Slutta' ? <div className='flex gap-1 items-center'><GiFinishLine className='text-green-500 w-5 h-5' />{row.getValue('active')}</div> : null}
        {(row.getValue('active') as string) === 'Ukjent' ? <div className='flex gap-1 items-center'><QuestionMarkCircledIcon className='text-amber-500 w-5 h-5' />{row.getValue('active')}</div> : null}
      </div>
    )
  },
  {
    header: "Kort beskrivelse",
    accessorKey: "shortDescription",
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }) => (
      <EditIntentButton size="sm" variant={'secondary'} id={(row.getValue('id') as string)} />
    )
  },
]
