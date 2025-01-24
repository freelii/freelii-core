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
import { ArrowUpDown, ChevronDown, Download, TableIcon, ClipboardCopy, Building2, Upload, Clock, CheckCircle2, CreditCard, UserPlus, Link2, Copy } from "lucide-react"
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
import { cn, CURRENCIES, GOOGLE_FAVICON_URL, noop, PHILIPPINES_FLAG } from "@freelii/utils"
import Link from "next/link"
import Image from "next/image"
import { useFixtures } from "@/fixtures/useFixtures"

dayjs.extend(relativeTime)

export type BankingDetails = {
  id: string
  name: string
  accountNumber: string
  routingNumber: string
  bankName: string
  bankAddress: string
  bankCity: string
  bankState: string
  bankZip: string
  currency: {
    shortName: string
    symbol: string
    name: string
    flag: string
  }
}

export type Recipient = {
  id: string
  isVerified: boolean
  name: string
  email: string
  notes?: string
  bankingDetails?: BankingDetails
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


export const columns: ColumnDef<Recipient>[] = [
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
    accessorKey: "name",
    header: "Contact",
    cell: ({ row }) => {
      const recipient = row.original
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div>{recipient.name}</div>
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
          <div className="text-xs text-gray-500">{recipient.email}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "bankingDetails",
    header: "Banking Details",
    cell: ({ row }) => {
      const bankingDetails = row.original.bankingDetails
      if (!bankingDetails) {
        return (
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Not provided</span>
          </div>
        )
      }

      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="text-sm font-medium flex items-center gap-1">
              <Building2 className="h-4 w-4 text-gray-500" />
              {bankingDetails.bankName}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Image
                src={bankingDetails.currency.flag}
                alt={bankingDetails.currency.name}
                width={16}
                height={16}
                className="rounded-full object-cover w-4 h-4 border-2 border-gray-200"
              />
              {bankingDetails.currency.name}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: true,
    cell: ({ row }) => {
      const [openPopover, setOpenPopover] = React.useState(false)

      return (
        <Popover
          openPopover={openPopover}
          setOpenPopover={setOpenPopover}
          align="end"
          content={
            <div className="w-full md:w-52">
              <div className="grid gap-px p-2">
                <button
                  onClick={() => {
                    setOpenPopover(false);
                  }}
                  className="w-full rounded-md p-2 hover:bg-gray-100 active:bg-gray-200"
                >
                  <IconMenu
                    text="Copy Email"
                    icon={<ClipboardCopy className="h-4 w-4" />}
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

export default function RecipientsTable() {
  const { getRecipients } = useFixtures()
  const [recipients, setRecipients] = React.useState<Recipient[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedRecipient, setSelectedRecipient] = React.useState<Recipient | null>(null)
  const detailsCardRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data: recipients,
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

  useEffect(() => {
    getRecipients().then((recipients) => {
      const recipientsWithMappedCurrencies = recipients.map(recipient => {
        if (recipient.bankingDetails) {
          const currencyCode = recipient.bankingDetails.currency.shortName
          return {
            ...recipient,
            bankingDetails: {
              ...recipient.bankingDetails,
              currency: CURRENCIES[currencyCode]
            }
          }
        }
        return recipient
      })
      setRecipients(recipientsWithMappedCurrencies)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        detailsCardRef.current && 
        !detailsCardRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('tr')
      ) {
        setSelectedRecipient(null)
      }
    }

    if (selectedRecipient) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [selectedRecipient])

  return (
    <div className="w-full relative">
      <div className="flex gap-6">
        <div className="flex-1 transition-all duration-300 ease-in-out">
          <Table className="border-none relative">
            <TableHeader className="border-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-xs font-medium p-1">
                      <>{header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}</>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="border-none">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell className="p-1 w-[40px]">
                      <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                    </TableCell>
                    <TableCell className="p-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell className="p-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50 relative",
                      selectedRecipient?.id === row.original.id && "bg-gray-50 after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:border-8 after:border-transparent after:border-r-gray-200",
                      selectedRecipient?.id === row.original.id && "rounded-full"
                    )}
                    onClick={() => {
                      setSelectedRecipient(
                        selectedRecipient?.id === row.original.id ? null : row.original
                      )
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="font-normal text-xs p-1">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-gray-900">No recipients yet</h3>
                      <p className="text-sm text-gray-500">Get started by adding your first recipient.</p>
                      <Button
                        className="mt-4 text-xs font-medium bg-black text-white hover:bg-neutral-900"
                      >
                        <Link href="recipients/new">
                          Add recipient
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {selectedRecipient ? (
          <div 
            ref={detailsCardRef}
            className={cn(
              "w-1/3",
              "rounded-lg",
              "border border-gray-200",
              "p-6",
              "mt-10",
              "relative",
              "transition-all duration-300 ease-in-out",
              "shadow-lg",
              selectedRecipient
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-full w-0 p-0 border-0'
            )}
          >
            <RecipientDetails recipient={selectedRecipient} />
          </div>
        ) : (
          <div className="w-1/3 rounded-lg border border-gray-200 p-6 mt-10">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center justify-center text-center gap-3">
                <div className="rounded-full bg-gray-100 p-4">
                  <UserPlus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900">Add a new recipient</h3>
                <p className="text-sm text-gray-500">
                  Create a new recipient to start sending payments. You'll need their email and banking details.
                </p>
                <Button
                  className="mt-2 text-xs font-medium bg-black text-white hover:bg-neutral-900 p-2"
                >
                  <Link href="recipients/new">
                    Add manually
                  </Link>
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <div className="rounded-full bg-gray-100 p-4">
                    <Link2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900">Share invite link</h3>
                  <p className="text-sm text-gray-500">
                    Send this link to your recipient and they can provide their details directly.
                  </p>
                </div>
                
                <div className="mt-2">
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value="https://app.freelii.com/invite/abc123"
                      className="text-sm text-gray-500 bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      className="shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText("https://app.freelii.com/invite/abc123")
                        // TODO: Add toast notification
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    This link expires in 7 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Actions Bar */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 bg-white rounded-full shadow-2xl border border-gray-200 z-50 shadow-gray-500/20">
          <div className="text-sm">
            <span className="font-medium">{Object.keys(rowSelection).length} recipients selected</span>
            <span className="mx-2 text-gray-400">·</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="group p-2 pr-4 bg-transparent hover:bg-gray-100 text-xs text-black flex items-center gap-2"
            >
              Add to new payout
              <ExpandingArrow className="-translate-x-2 size-3 group-hover:translate-x-0 transition-all duration-300 ease-in-out" />
            </Button>
          </div>
        </div>
      )}

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

interface RecipientDetailsProps {
  recipient: Recipient
}

function RecipientDetails({ recipient }: RecipientDetailsProps) {
  return (
    <div className="transition-opacity duration-200 delay-150 opacity-100">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">{recipient.name}</h3>
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
        <p className="text-xs text-gray-500">{recipient.email}</p>
      </div>

      <div className="space-y-6">
        {recipient.bankingDetails ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-medium">Banking Details</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Bank Name</div>
                  <div className="text-sm font-medium">{recipient.bankingDetails.bankName}</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                  <Image
                    src={recipient.bankingDetails.currency.flag}
                    alt={recipient.bankingDetails.currency.name}
                    width={16}
                    height={16}
                    className="rounded-full object-cover w-4 h-4"
                  />
                  <span className="text-xs text-gray-600">{recipient.bankingDetails.currency.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Account Number</div>
                  <div className="text-sm font-medium">{recipient.bankingDetails.accountNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Routing Number</div>
                  <div className="text-sm font-medium">{recipient.bankingDetails.routingNumber}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Bank Address</div>
                <div className="text-sm font-medium">{recipient.bankingDetails.bankAddress}</div>
                <div className="text-sm font-medium">{`${recipient.bankingDetails.bankCity}, ${recipient.bankingDetails.bankState} ${recipient.bankingDetails.bankZip}`}</div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-medium">Banking Details</h4>
            </div>
            <p className="mt-2 text-xs text-gray-500">Not provided</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-2">Notes</h4>
          <p className="text-xs text-gray-600">{recipient.notes || 'No notes provided'}</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
            Remove Recipient
          </Button>
          <Button size="sm" className="ml-auto">
            Edit Details
          </Button>
        </div>
      </div>
    </div>
  )
}
