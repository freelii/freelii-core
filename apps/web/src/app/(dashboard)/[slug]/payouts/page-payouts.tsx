"use client"

import React, { useEffect, useRef } from "react"
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
import { ArrowUpDown, ChevronDown, Download, TableIcon, ClipboardCopy, Building2, Upload, Clock, CheckCircle2 } from "lucide-react"
import { ArrowsOppositeDirectionY, Badge, Button, ExpandingArrow, IconMenu, Input, Popover, ThreeDots } from "@freelii/ui"
import { Checkbox } from "@freelii/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@freelii/ui/table"
import { PaymentDetails } from "./payment-details"
import { cn, CURRENCIES, GOOGLE_FAVICON_URL, noop, PHILIPPINES_FLAG } from "@freelii/utils"
import Link from "next/link"
import Image from "next/image"
import { useFixtures } from "@/fixtures/useFixtures"

dayjs.extend(relativeTime)

export type Currency = {
  id: string
  name: string
  symbol: string
  flag: string
}

export type BankingDetails = {
  id: number
  name: string
  address: string
  city: string
  state: string
  zip: string
  country: string
}

export type Recipient = {
  id: string
  isVerified: boolean
  name: string
  email: string
  notes?: string
  locationId?: number
  location?: Location
  currencyId?: string
  currency?: Currency
}

export type Payment = {
  id: string
  amount: number
  currency: string
  label: string
  nextPayment: Date
  recipient?: Recipient
  recipientId?: number
  progress: string
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
        onClick={(e) => e.stopPropagation()}
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
        onClick={(e) => e.stopPropagation()}
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
    cell: ({ row }) =>{
      const recipient = row.original.recipient
      if(!recipient) {
        return <div className="text-xs text-gray-500">No recipient</div>
      }
      return (
        <div className="flex items-center gap-2">
          <div>{recipient.name}</div>
          <div className="text-xs text-gray-500">{recipient.email}</div>
          {recipient.isVerified ? (
            <Badge className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-xs">Verified</span>
            </Badge>
          ) : (
            <Badge className="flex items-center gap-1 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100">
              <Clock className="h-3 w-3" />
              <span className="text-xs">Pending</span>
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const currency = row.original.currency
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(amount)

      const currencyInfo = CURRENCIES[currency] 

      return (
        <div className="flex items-center justify-end gap-2">
          <div className="font-medium">{formatted}</div>
          {currencyInfo && (<Badge className="flex items-center gap-1 rounded-full bg-gradient-to-br border-none from-gray-200 to-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
            <div className="size-4">
              <Image src={currencyInfo.flag} alt={currencyInfo.name} className="size-4" width={16} height={16} />  
            </div>
            <div className="text-xs font-bold text-gray-600">{currencyInfo.symbol}</div>
          </Badge>)}
        </div>
      )
    },
  },
  {
    accessorKey: "progress",
    header: "Payment frequency",
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
                  Import from CSV
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
            onClick={(e) => {
              e.stopPropagation()
              setOpenPopover(!openPopover)
            }}
            className="w-auto px-1.5"
          >
            <ThreeDots className="h-5 w-5 text-gray-500" />
          </button>
        </Popover>
      )
    },
  },
]

export default function PayoutsTable() {
  const { getPayouts } = useFixtures()
  const [payments, setPayments] = React.useState<Payment[]>([])
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
  const detailsRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    console.log('fetching payments')
    getPayouts().then(setPayments)
  }, [setPayments])

  useEffect(() => {
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        setSelectedPayment(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="w-full relative">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-xs font-medium p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
            onClick={() => {/* TODO: Import handler */}}
          >
            Import from CSV
            <Upload className="size-4 ml-1" />
          </Button>
            <Button
            variant="outline"
            className="text-xs font-medium p-2 text-neutral-200 bg-black hover:bg-neutral-900 hover:text-white"
            onClick={noop}
          >
            <Link href={`payouts/new`}>
              New Payment
            </Link>
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
                      <TableHead key={header.id} className="text-xs font-medium p-1">
                        <>{header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}</>
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
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPayment(
                        selectedPayment?.id === row.original.id ? null : row.original
                      )
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="font-normal text-xs p-1">
                        <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-96 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full bg-gray-100 p-3">
                        <ArrowsOppositeDirectionY className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-gray-900">No payments yet</h3>
                      <p className="text-sm text-gray-500">Get started by creating your first payment or importing existing ones.</p>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          className="text-xs font-medium p-2"
                          onClick={() => {/* TODO: Import handler */}}
                        >
                          Import payments
                          <Upload className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                          className="text-xs font-medium bg-black text-white hover:bg-neutral-900 p-2"
                        >
                          <Link href="payouts/new">
                            Create payment
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div 
          ref={detailsRef}
          className={cn(
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
          )}
        >
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

      {/* Floating Actions Bar */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 bg-white rounded-full shadow-2xl border border-gray-200 z-50 shadow-gray-500/20">
          <div className="text-sm">
            <span className="font-medium">{Object.keys(rowSelection).length} payments selected</span>
            <span className="mx-2 text-gray-400">·</span>
            <span className="text-gray-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(
                table.getSelectedRowModel().rows.reduce(
                  (total, row) => total + parseFloat(row.original.amount),
                  0
                )
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-xs p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => table.resetRowSelection()}
            >
              Cancel payments
            </Button>
            <Button
              className="group text-xs p-2 pr-6 bg-transparent text-black hover:bg-gray-100 flex items-center gap-2"
            >
              Process {Object.keys(rowSelection).length} payments
              <ExpandingArrow className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
