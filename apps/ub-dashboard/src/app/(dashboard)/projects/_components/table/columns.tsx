"use client"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { ColumnDef } from "@tanstack/react-table"
import { ProjectProps } from '../projects'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { EditIntentButton } from '@/components/edit-intent-button'
import { Badge } from '@/components/ui/badge'
import millify from 'millify'
import ImageBox from '@/components/image-box'

export const columns: ColumnDef<ProjectProps>[] = [
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
      <div className='w-[200px]'>
        {row.original.logo ? (
          <div className='w-[20px] h-[20px]'>
            <ImageBox image={row.original.logo} width={20} height={20} alt="" classesWrapper='relative aspect-[1/1] rounded-full' />
          </div>
        ) : null}
        <Link href={`/projects/${row.getValue('id')}`} className='font-bold'>
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
          <Badge variant="secondary" className='grow-0' key={i}>
            {t.label}
          </Badge>
        ))}
      </div>
    )
  },
  {
    header: "Periode",
    accessorKey: "timespan.edtf"
  },
  {
    header: "Status",
    accessorKey: "active"
  },
  {
    header: "Finansiering",
    accessorKey: "funding",
    cell: ({ row }) => (
      <div className='flex gap-2'>
        {(row.getValue('funding') as any[])?.filter(element => {
          if (Object.keys(element).length !== 0) {
            return true;
          }

          return false;
        }).map((f, i) => (
          <div key={i}>
            <div className='font-semibold'>{f.amount > 999999.99 ? millify(f.amount, { precision: 2, locales: 'no', space: true, units: ['', '', 'MILL', 'MRD'] }) : f.amount}  {f.currency}</div>
            <div><strong>{f.awarder}</strong> ({f.period})</div>
          </div>
        ))}
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
