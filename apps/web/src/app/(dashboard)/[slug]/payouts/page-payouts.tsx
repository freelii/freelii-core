"use client"

import * as React from "react"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Download, TableIcon, ClipboardCopy, Building2 } from "lucide-react"
import { Button, IconMenu, Input, Popover, ThreeDots } from "@freelii/ui"
import { Checkbox } from "@freelii/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@freelii/ui/table"
import UserDropdown from "@/ui/layout/sidebar/user-dropdown"
import { PaymentDetails } from "./payment-details"
import { cn } from "@freelii/utils"

dayjs.extend(relativeTime)

export type Payment = {
  id: string
  amount: number
  currency: string
  label: string
  nextPayment: Date
  recipient: string
  progress: string
  recipient_email: string
  notes?: string
}

function ImportOption({
  children,
  setOpenPopover,
  onClick,
}: {
  children: React.ReactNode;
  setOpenPopover: React.Dispatch<React.SetStateAction<boolean>>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-md p-2 hover:bg-gray-100 active:bg-gray-200"
    >
      {children}
    </button>
  );
}


export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nextPayment",
    header: "Next Payment",
    cell: ({ row }) => {
      const date = new Date(row.getValue("nextPayment"))
      const relativeDate = dayjs(date).fromNow()
      return (
        <div className="flex items-center gap-2">
          <div>{dayjs(date).format('MMM DD')}</div>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {relativeDate}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "recipient",
    header: "Recipient",
    cell: ({ row }) => <div>{row.getValue("recipient")}</div>,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const currency = row.original.currency
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)

      return (
        <div className="flex items-center justify-end gap-2">
          <div className="font-medium">{formatted}</div>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {currency}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const progress = row.getValue("progress") as Payment["progress"]
      return <div className="">{progress}</div>
    },
  },
  {
    id: "actions",
    enableHiding: true,
    cell: ({ row }) => {
      const payment = row.original
      const [openPopover, setOpenPopover] = React.useState(false)

      return (
        <Popover
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
        align="end"
          content={
            <div className="w-full md:w-52">
              <div className="grid gap-px p-2">
                <p className="mb-1.5 mt-1 flex items-center gap-2 px-1 text-xs font-medium text-gray-500">
                  Import Links
                </p>
                <ImportOption
                  onClick={() => {
                    setOpenPopover(false);
                  }}
                  setOpenPopover={setOpenPopover}
                >
                  <IconMenu
                    text="Import from Bitly"
                    icon={
                      <img
                        src="https://assets.dub.co/misc/icons/bitly.svg"
                        alt="Bitly logo"
                        className="h-4 w-4"
                      />
                    }
                  />
                </ImportOption>
                <ImportOption
                  onClick={() => {
                    setOpenPopover(false);
                  }}
                  setOpenPopover={setOpenPopover}
                >
                  <IconMenu
                    text="Import from Rebrandly"
                    icon={
                      <img
                        src="https://assets.dub.co/misc/icons/rebrandly.svg"
                        alt="Rebrandly logo"
                        className="h-4 w-4"
                      />
                    }
                  />
                </ImportOption>
                <ImportOption
                  onClick={() => {
                    setOpenPopover(false);
                  }}
                  setOpenPopover={setOpenPopover}
                >
                  <IconMenu
                    text="Import from Short.io"
                    icon={
                      <img
                        src="https://assets.dub.co/misc/icons/short.svg"
                        alt="Short.io logo"
                        className="h-4 w-4"
                      />
                    }
                  />
                </ImportOption>
                <ImportOption
                  onClick={() => {
                    setOpenPopover(false);
                  }}
                  setOpenPopover={setOpenPopover}
                >
                  <IconMenu
                    text="Import from CSV"
                    icon={<TableIcon className="size-4" />}
                  />
                </ImportOption>
              </div>
              <div className="border-t border-gray-200" />
              <div className="grid gap-px p-2">
                <p className="mb-1.5 mt-1 flex items-center gap-2 px-1 text-xs font-medium text-gray-500">
                  Export Links
                </p>
                <button
                  onClick={() => {
                    setOpenPopover(false);
                  }}
                  className="w-full rounded-md p-2 hover:bg-gray-100 active:bg-gray-200"
                >
                  <IconMenu
                    text="Export as CSV"
                    icon={<Download className="h-4 w-4" />}
                  />
                </button>
              </div>
            </div>
          }
        >
          <button
            onClick={() => setOpenPopover(!openPopover)}
            className="w-auto px-1.5"
          >
            <ThreeDots className="h-5 w-5 text-gray-500" />
          </button>
        </Popover>
      )
    },
  },
]

export default function DataTableDemo({payments}: {payments: Payment[]}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [openPopover, setOpenPopover] = React.useState(false)
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null)
  const table = useReactTable({
    data: payments,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  React.useEffect(() => {
    if (selectedPayment) {
      // hide progress column
      console.log(table.getAllColumns().map(column => column.id))
      table.getColumn('progress')?.toggleVisibility(false)
      table.getColumn('actions')?.toggleVisibility(false)
    } else {
      // show progress column
      table.getColumn('actions')?.toggleVisibility(true)
      table.getColumn('progress')?.toggleVisibility(true)
    }
  }, [selectedPayment])

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {/* TODO: Import handler */}}
          >
            Import Payments
          </Button>
          <Button
            onClick={() => {/* TODO: Schedule handler */}}
          >
            Schedule Payment
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className={`
          flex-1 
          transition-all duration-300 ease-in-out
        `}>
          <Table className="border-none relative">
            <TableHeader className="border-none">
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
            <TableBody className="border-none">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50 relative",
                      selectedPayment?.id === row.original.id && "bg-gray-50 after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:border-8 after:border-transparent after:border-r-gray-200",
                      selectedPayment?.id === row.original.id && "rounded-full"
                    )}
                    onClick={() => setSelectedPayment(
                      selectedPayment?.id === row.original.id ? null : row.original
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className={cn(
          "w-1/3", 
          "rounded-lg", 
          "border border-gray-200",
          "p-6",
          "mt-10",
          "relative",
          "transition-all duration-300 ease-in-out",
          "shadow-lg",
          selectedPayment 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-full w-0 p-0 border-0'
        )}>
          {selectedPayment && <PaymentDetails payment={selectedPayment} />}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
