"use client"

import { DataTable } from '@/components/data-table';
import { EditIntentButton } from '@/components/edit-intent-button';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CaretSortIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

const columns = [
  {
    accessorKey: "label",
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
        <Link href={`/software/${row.getValue('id')}`} className='font-bold'>
          {row.getValue('label')}
        </Link>
      </div>
    )
  },
  {
    header: "Type",
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
    accessorKey: "timespan"
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }: { row: any }) => (
      <EditIntentButton size="sm" variant={'secondary'} id={(row.getValue('id') as string)} />
    )
  },
];

export const ResponsibleFor = ({ data }: { data: any }) => {
  return (
    <>
      {data.length === 0 ? (
        <Alert>
          <AlertTitle>
            Ikke ansvar for noen tjenester eller systemer, eller det er ikke registrert.
          </AlertTitle>
        </Alert>
      ) :
        <DataTable columns={columns} data={data} />
      }
    </>
  )
}
