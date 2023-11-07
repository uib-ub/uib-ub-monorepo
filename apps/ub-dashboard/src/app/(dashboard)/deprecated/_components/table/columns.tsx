"use client"

import { CaretSortIcon, CheckCircledIcon, ClockIcon, CrossCircledIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import { ColumnDef } from "@tanstack/react-table"
import { DeprecatedProps } from '../deprecated'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { EditIntentButton } from '@/components/edit-intent-button'

export const columns: ColumnDef<DeprecatedProps>[] = [
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
    cell: ({ row }) => (
      <div className='flex flex-col gap-1'>
        {row.getValue('label')}
      </div>
    )
  },
  {
    header: "Type",
    accessorKey: "type",
  },
  {
    header: "ID",
    accessorKey: "id",
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
    header: "",
    accessorKey: "id",
    cell: ({ row }: { row: any }) => (
      <EditIntentButton
        variant={'secondary'}
        className='text-xs px-2 py-0'
        id={row.getValue('id')}
      />
    )
  }
]
