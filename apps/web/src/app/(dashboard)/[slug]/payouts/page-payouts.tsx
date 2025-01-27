"use client"

import { useFixtures } from "@/fixtures/useFixtures"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { ArrowsOppositeDirectionY, Badge, BlurImage, Button, Checkbox, ExpandingArrow } from "@freelii/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@freelii/ui/table"
import { cn, CURRENCIES, DICEBEAR_SOLID_AVATAR_URL, noop } from "@freelii/utils"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CheckCircle2, ChevronRight, Download } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useRef } from "react"
import { PaymentDetails } from "./payment-details"

dayjs.extend(relativeTime)

export type Currency = {
  currencyCode: string
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
  currency?: Currency
}

export type Recipient = {
  id: number
  isVerified: boolean
  name: string
  email: string
  notes?: string
  locationId?: number
  location?: Location
  currencyId?: string
  bankingDetails?: BankingDetails
  recipientType?: "personal" | "business"
}

export type Payout = {
  id: string
  amount: number
  currency: string
  label: string
  nextPayment: Date
  recipients: Recipient[]
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
      className="rounded-md p-2 hover:bg-gray-100 active:bg-gray-200"
    >
      {children}
    </button>
  );
}


export const columns: ColumnDef<Payout>[] = [
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
    header: "Payout Date",
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
    accessorKey: "amount",
    header: () => <div className="text-left">Amount</div>,
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
          <FlagIcon currencyCode={currency} />
          <div className="font-medium">{formatted}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "recipients",
    header: "Recipients",
    cell: ({ row }) => {
      const recipients = row.original.recipients
      if (!recipients?.length) {
        return <div className="text-xs text-gray-500">No recipients</div>
      }

      const firstThreeRecipients = recipients.slice(0, 3)
      const remainingCount = recipients.length - 3

      return (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {firstThreeRecipients.map((recipient, index) => (
              <BlurImage
                key={recipient.id}
                src={`${DICEBEAR_SOLID_AVATAR_URL}${recipient.name}`}
                width={12}
                height={12}
                alt={recipient.name}
                className="size-6 shrink-0 overflow-hidden rounded-full"
                style={{ zIndex: 3 - index }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm">
              {firstThreeRecipients.map((r, i) => (
                <span key={r.id}>
                  {i > 0 && i === firstThreeRecipients.length - 1 && remainingCount === 0 && " and "}
                  {i > 0 && i < firstThreeRecipients.length - 1 && ", "}
                  {r.name}
                </span>
              ))}
              {remainingCount > 0 && ` and ${remainingCount} more`}
            </div>
            {recipients.some(r => r.isVerified) && (
              <Badge className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                <CheckCircle2 className="h-3 w-3" />
                <span className="text-xs">Verified</span>
              </Badge>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "progress",
    header: "Payment frequency",
    cell: ({ row }) => {
      const progress = row.getValue("progress")
      return <div className="">{progress as string}</div>
    },
  },
]

export default function PayoutsTable() {
  const { getPayouts } = useFixtures()
  const [payouts, setPayouts] = React.useState<Payout[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [openPopover, setOpenPopover] = React.useState(false)
  const [selectedPayout, setSelectedPayout] = React.useState<Payout | null>(null)
  const table = useReactTable({
    data: payouts,
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
    getPayouts().then(setPayouts).catch(console.error)
  }, [setPayouts])

  useEffect(() => {
    if (selectedPayout) {
      // hide progress column
      console.log(table.getAllColumns().map(column => column.id))
      table.getColumn('progress')?.toggleVisibility(false)
    } else {
      // show progress column
      table.getColumn('progress')?.toggleVisibility(true)
    }
  }, [selectedPayout])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        setSelectedPayout(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const selectedTotal = table.getSelectedRowModel().rows.reduce(
    (total, row) => {
      const payout = row.original
      return total + (payout.amount * payout.recipients.length)
    },
    0
  )

  return (
    <div className="w-full relative">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2 w-full items-center justify-end">
          <Button
            disabled
            variant="outline"
            className="text-xs font-medium p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 cursor-not-allowed"
            onClick={() => {/* TODO: Import handler */ }}
          >
            Export to CSV
            <Download className="size-4 ml-1" />
          </Button>
          <Button
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
                      selectedPayout?.id === row.original.id && "bg-gray-50 after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:border-8 after:border-transparent after:border-r-gray-200",
                      selectedPayout?.id === row.original.id && "rounded-full"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPayout(
                        selectedPayout?.id === row.original.id ? null : row.original
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
                      <h3 className="font-medium text-gray-900">No payouts yet</h3>
                      <p className="text-sm text-gray-500">Get started by creating your first payment or importing existing ones.</p>
                      <div className="mt-4 flex gap-2">
                        <Button
                          className="text-xs font-medium bg-black text-white hover:bg-neutral-900 p-2"
                        >
                          <Link href="payouts/new">
                            Create payout
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
            selectedPayout
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-full w-0 p-0 border-0'
          )}
        >
          {selectedPayout && <PaymentDetails payment={selectedPayout} />}
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
            className="text-xs font-medium p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="text-xs font-medium p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="size-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Floating Actions Bar */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 bg-white rounded-full shadow-2xl border border-gray-200 z-50 shadow-gray-500/20">
          <div className="text-sm">
            <span className="font-medium">
              {Object.keys(rowSelection).length} payouts selected
            </span>
            <span className="mx-2 text-gray-400">·</span>
            <span className="text-gray-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(selectedTotal)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-xs p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => table.resetRowSelection()}
            >
              Cancel payouts
            </Button>
            <Button
              className="group text-xs p-2 pr-6 bg-transparent text-black hover:bg-gray-100 flex items-center gap-2"
            >
              Process {Object.keys(rowSelection).length} payouts
              <ExpandingArrow className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
