"use client"
import { CaretSortIcon, CheckCircledIcon, CheckboxIcon, CrossCircledIcon } from "@radix-ui/react-icons"
import { ColumnDef } from "@tanstack/react-table"
import { SoftwareListProps } from './software-list'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { EditIntentButton } from '@/components/edit-intent-button'
import { Badge } from '@/components/ui/badge'
import { path, uniqueStringArray } from '@/lib/utils'
import ImageBox from '@/components/image-box'

export const columns: ColumnDef<SoftwareListProps>[] = [
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
      <div className='w-[200px] flex gap-1'>
        {row.original.logo ? (
          <div className='w-[20px] h-[20px]'>
            <ImageBox image={row.original.logo} width={20} height={20} alt="" classesWrapper='relative aspect-[1/1] rounded-full' />
          </div>
        ) : null}
        <Link href={`/${path[row.original.type]}/${row.getValue('id')}`} className='font-bold'>
          {row.getValue('label')}
        </Link>
      </div>
    )
  },
  {
    header: "Type",
    accessorKey: "hasType",
    cell: ({ row }) => (
      <div className='flex flex-wrap gap-2'>
        {(row.getValue('hasType') as any[])?.map((t: any, i: number) => (
          <Badge variant="secondary" className='grow-0' key={t.id}>
            {t.label}
          </Badge>
        ))}
      </div>
    )
  },
  {
    header: "Utviklet av UB",
    accessorKey: "madeByUB",
    cell: ({ row }) => (
      <div className='flex flex-wrap gap-2'>
        {(row.getValue('madeByUB') as boolean) ? <CheckCircledIcon className='text-green-500 w-5 h-5' /> : <CrossCircledIcon className='text-red-500 w-5 h-5' />}
      </div>
    )
  },
  {
    header: "Vert",
    accessorKey: "hostedBy",
    cell: ({ row }) => {
      const hostedBy = uniqueStringArray(row.original.hostedBy)
      return (
        <div className='flex flex-wrap gap-2'>
          {hostedBy.map((t: any) => (
            <Badge variant="secondary" className='grow-0' key={t}>
              {t}
            </Badge>
          ))}
        </div>
      )
    }
  },
  {
    header: "Kjører på",
    accessorKey: "runBy",
    cell: ({ row }) => {
      const runBy = uniqueStringArray(row.original.runBy)
      return (
        <div className='flex flex-wrap gap-2'>
          {runBy.map((t: any) => (
            <Badge variant="secondary" className='grow-0' key={t}>
              {t}
            </Badge>
          ))}
        </div>
      )
    }
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }) => (
      <EditIntentButton size="sm" variant={'secondary'} id={(row.getValue('id') as string)} />
    )
  },
]
