"use client"

import { DataTable } from '@/components/data-table';
import { EditIntentButton } from '@/components/edit-intent-button';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
        <Link href={`/groups/${row.getValue('id')}`} className='font-bold'>
          {row.getValue('label')}
        </Link>
      </div>
    )
  },
  {
    header: "Rolle",
    accessorKey: "hasMember",
    cell: ({ row }: { row: any }) => (
      <div className='flex flex-col gap-2'>
        {row.getValue('hasMember')?.map((t: any, i: number) => (
          <div key={i}>
            {t.assignedRole?.map((r: any, i: number) => (
              <Badge key={i} variant='outline'>
                {r.label} {t.timespan ? `(${t.timespan})` : null}
              </Badge>
            ))}
          </div>
        ))}
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
    header: "Status",
    accessorKey: "active"
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }: { row: any }) => (
      <EditIntentButton size="sm" variant={'secondary'} id={(row.getValue('id') as string)} />
    )
  },
];

export const MemberOf = ({ data }: { data: any }) => {
  return (
    <>
      {data.length === 0 ? (
        <Alert>
          <AlertTitle>
            Ingen medlemskap registrert
          </AlertTitle>
        </Alert>
      ) :
        <DataTable
          columns={columns}
          data={data}
          config={{
            activeFilter: true,
          }}
        />
      }
    </>
  )
}
