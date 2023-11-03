"use client"

import { useEffect, useState } from "react"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  config?: {
    labelSearch?: boolean,
    activeFilter?: boolean,
    externalSoftwareFilter?: boolean,
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  config = {},
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    /* @ts-ignore */
    [
      config.activeFilter ? { id: "active", value: "Aktiv" } : null,
      config.externalSoftwareFilter ? { id: "madeByUB", value: true } : null,
    ].filter(Boolean)
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  // Get flat array of all accessorKeys
  const flatColumns = columns.flatMap((column: any) => {
    return column.accessorKey
  })

  return (
    <div className='flex flex-col gap-4'>
      {config.labelSearch === true || config.activeFilter === true || config.externalSoftwareFilter === true ? (<div className="flex items-center gap-5">
        {flatColumns.includes('label') && config?.labelSearch ? (
          <Input
            placeholder="Filtrér på navn..."
            value={(table.getColumn("label")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("label")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        ) : null}

        {flatColumns.includes('active') && config?.activeFilter ? (
          <div className="flex items-center space-x-2">
            <Switch
              id="active-switch"
              checked={(table.getColumn("active")?.getFilterValue() as string) ? true : false}
              onCheckedChange={(event) => {
                if (event === true) {
                  table.getColumn("active")?.setFilterValue("Aktiv")
                  return
                }
                table.getColumn("active")?.setFilterValue('')
              }}
            />
            <Label htmlFor="active-switch">Aktive (som vi vet om). Forvirra? Mere data løser det 😊.</Label>
          </div>
        ) : null}

        {flatColumns.includes('madeByUB') && config?.externalSoftwareFilter ? (
          <div className="flex items-center space-x-2">
            <Switch
              id="external-software-switch"
              checked={(table.getColumn("madeByUB")?.getFilterValue() as boolean) ? true : false}
              onCheckedChange={(event) => {
                table.getColumn("madeByUB")?.setFilterValue(event === true ? true : '')
                return
              }}
            />
            <Label htmlFor="external-software-switch">Utviklet av UB</Label>
          </div>
        ) : null}
      </div>) : null}

      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
