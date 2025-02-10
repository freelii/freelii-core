"use client"

import { useWalletStore } from "@/hooks/stores/wallet-store"
import { api } from "@/trpc/react"
import { ArrowsOppositeDirectionY, Badge, BlurImage, Button, Checkbox, Download } from "@freelii/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@freelii/ui/table"
import { cn, DICEBEAR_SOLID_AVATAR_URL, fromStroops, noop } from "@freelii/utils"
import { VerificationStatus } from "@prisma/client"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CheckCircle2, ChevronRight } from "lucide-react"
import Link from "next/link"
import React, { useEffect } from "react"
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
  createdAt: Date
  id: string
  amount: string
  currency: string
  label: string
  nextPayment: Date
  recipients: Recipient[]
  progress: string
  notes?: string
  status: string
  isInstant: boolean
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
    size: 40,
  },
  {
    accessorKey: "nextPayment",
    header: () => <div className="text-left">Payment Date</div>,
    size: 100,
    cell: ({ row }) => {
      const date = new Date(row.getValue("nextPayment"))
      const relativeDate = dayjs(date).fromNow()
      return (
        <div className="flex items-center gap-2 text-left">
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
    size: 160,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start gap-2">
          <div className="font-medium">{row.getValue("amount")}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "recipients",
    header: () => <div className="text-left">Recipient</div>,
    size: 300,
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
    size: 160,
    cell: ({ row }) => {
      const progress = row.getValue("progress")
      return <div className="">{progress as string}</div>
    },
  },
  {
    accessorKey: "actions",
    enableHiding: true,
    header: () => null,
    size: 120,
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/invoices/create?tx_id=${row.original.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors hover:border-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
            Generate Invoice
          </span>
        </Link>
      )
    },
  },
]

export default function PayoutsTable() {
  const { selectedWalletId } = useWalletStore();
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

  const { data: txs, isLoading } = api.ledger.getPayouts.useQuery({
    walletId: String(selectedWalletId),
    limit: 10,
    offset: 0
  }, {
    enabled: !!selectedWalletId
  })

  useEffect(() => {
    if (txs) {
      setPayouts(txs.map(tx => {
        const amount = fromStroops(tx.amount)
        return {
          createdAt: tx.created_at,
          id: tx.id,
          amount,
          currency: tx.currency,
          label: tx.recipient.name,
          nextPayment: tx.created_at,
          recipients: [tx.recipient ? {
            id: tx.recipient.id,
            name: tx.recipient.name,
            email: tx.recipient.email,
            isVerified: tx.recipient.verification_status === VerificationStatus.VERIFIED,
          } : null] as Recipient[],
          progress: "One-time payment",
          status: tx.status,
          isInstant: !!tx.blockchain_tx_hash
        }
      }))
    }
  }, [txs])

  useEffect(() => {
    if (selectedPayout) {
      // hide progress and actions columns
      table.getColumn('progress')?.toggleVisibility(false)
      table.getColumn('actions')?.toggleVisibility(false)
    } else {
      // show progress and actions columns
      table.getColumn('progress')?.toggleVisibility(true)
      table.getColumn('actions')?.toggleVisibility(true)
    }
  }, [selectedPayout])


  const handlePaymentSelect = (payout: Payout | null) => {
    if (payout?.id === selectedPayout?.id) {
      setSelectedPayout(null)
    } else {
      setSelectedPayout(payout)
    }
  }

  return (
    <div className="">
      <div className="mb-4 flex items-center justify-between ">
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
      <div className="grid grid-cols-12 gap-6">
        <div className={cn(
          "flex-1",
          selectedPayout ? "col-span-8" : "col-span-12"
        )}>
          <Table className="border-none relative" >
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
              {isLoading ? (
                // Loading skeleton rows
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="animate-pulse">
                    {columns.map((column, cellIndex) => (
                      <TableCell key={`skeleton-cell-${cellIndex}`} className="p-1">
                        <div className="h-4 bg-gray-200 rounded w-[80%]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50 group transition-all duration-300 ease-in-out",
                      selectedPayout?.id === row.original.id && "bg-gray-100"
                    )}
                    onClick={(e) => {
                      handlePaymentSelect(row.original)
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cn("font-normal text-xs p-1", selectedPayout?.id === row.original.id && "font-semibold")}>
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
        </div>

        {selectedPayout && (
          <div className="bg-gradient-to-br from-white rounded-lg to-neutral-50 col-span-4 border-[1px] border-gray-200 mt-4 p-4 transition-all duration-300">
            <PaymentDetails
              payment={selectedPayout}
              onClose={() => handlePaymentSelect(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
