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
import { ArrowUpDown, ChevronDown, Download, TableIcon, ClipboardCopy, Building2, Upload, Clock, CheckCircle2, CreditCard, UserPlus, Link2, Copy, Search, DollarSign } from "lucide-react"
import { ArrowsOppositeDirectionY, Badge, Button, ExpandingArrow, IconMenu, Input, Popover, ThreeDots, Card, Label, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, BlurImage } from "@freelii/ui"
import { Checkbox } from "@freelii/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@freelii/ui/table"
import { cn, CURRENCIES, GOOGLE_FAVICON_URL, noop, PHILIPPINES_FLAG, DICEBEAR_SOLID_AVATAR_URL, pluralize } from "@freelii/utils"
import Link from "next/link"
import Image from "next/image"
import { useFixtures } from "@/fixtures/useFixtures"
import { ToggleGroup, ToggleGroupItem } from "@freelii/ui"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@freelii/ui"

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
  id: number
  isVerified: boolean
  name: string
  email: string
  notes?: string
  bankingDetails?: BankingDetails
  recipientType: string
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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
        className="translate-y-[2px]"
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
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Badge className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-help">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-xs">Verified</span>
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 bg-white shadow-lg border border-gray-200 z-50">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-green-50 p-2">
                        <CheckCircle2 className="h-4 w-4 text-green-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Verified Recipient</h4>
                        <p className="text-xs text-gray-500">This recipient has completed all verification steps</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-green-700" />
                        <span>Email verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-green-700" />
                        <span>Identity verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-green-700" />
                        <span>Banking details verified</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Verified on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Badge className="flex items-center gap-1 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 cursor-help">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">Pending</span>
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 bg-white shadow-lg border border-gray-200 z-50">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-gray-50 p-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Verification Pending</h4>
                        <p className="text-xs text-gray-500">This recipient needs to complete verification</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>Email verification required</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>Identity verification required</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>Banking details needed</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Added on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
          <div className="text-xs text-gray-500">{recipient.email}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "recipientType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.recipientType
      return (
        <Badge 
          className={cn(
            "flex items-center gap-1",
            type === 'business' 
              ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
          )}
        >
          {type === 'business' ? (
            <Building2 className="h-3 w-3" />
          ) : (
            <UserPlus className="h-3 w-3" />
          )}
          <span className="text-xs capitalize">{type}</span>
        </Badge>
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
             {bankingDetails?.currency && <Image
                src={bankingDetails?.currency?.flag}
                alt={bankingDetails?.currency?.name}
                width={16}
                height={16}
                className="rounded-full object-cover w-4 h-4 border-2 border-gray-200"
              />}
              {bankingDetails?.currency?.name}
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

type RecipientsTableProps = {
  mode?: 'default' | 'payout'
}

export default function RecipientsTable({ mode = 'default' }: RecipientsTableProps) {
  const { getRecipients, subAccounts } = useFixtures()
  const [recipients, setRecipients] = React.useState<Recipient[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [selectedRecipient, setSelectedRecipient] = React.useState<Recipient | null>(null)
  const detailsCardRef = useRef<HTMLDivElement>(null)
  const [recipientTypeFilter, setRecipientTypeFilter] = React.useState<string | null>(null)
  const [showAddNew, setShowAddNew] = React.useState(false)
  const addNewCardRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedRecipients, setSelectedRecipients] = React.useState<Recipient[]>([])
  const hasSelectedRecipients = mode === 'payout' && selectedRecipients.length > 0

  // Update selectedRecipients when rowSelection changes
  useEffect(() => {
    const selected = recipients.filter((recipient) => {
      const id = recipient.id.toString()
      return rowSelection[id]
    })
    console.log(rowSelection,selected)
    setSelectedRecipients(selected)
  }, [recipients, rowSelection])

  const filteredRecipients = React.useMemo(() => {
    let filtered = recipients
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(recipient => 
        recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Filter by recipient type
    if (recipientTypeFilter) {
      filtered = filtered.filter(recipient => recipient.recipientType === recipientTypeFilter)
    }
    
    return filtered
  }, [recipients, recipientTypeFilter, searchQuery])

  const table = useReactTable({
    data: filteredRecipients,
    columns,
    getRowId: (row) => row.id.toString(),
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
    enableRowSelection: true,
  })

  useEffect(() => {
    getRecipients().then((recipients) => {
      const recipientsWithMappedCurrencies = recipients.map(recipient => {
        if (recipient.bankingDetails) {
          const currencyCode = recipient.bankingDetails?.currency?.currencyCode
          return {
            ...recipient,
            bankingDetails: {
              ...recipient.bankingDetails,
              currency: currencyCode ? CURRENCIES[currencyCode as keyof typeof CURRENCIES] : undefined
            }
          }
        }
        return recipient
      })
      setRecipients(recipientsWithMappedCurrencies as Recipient[])
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        addNewCardRef.current && 
        !addNewCardRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button')?.contains(document.querySelector('[data-add-new-button]'))
      ) {
        setShowAddNew(false)
      }
    }

    if (showAddNew) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showAddNew])

  return (
    <div className="w-full relative space-y-6">
      {/* Floating Actions Bar - only shown in default mode */}
      {mode === 'default' && selectedRecipients.length > 0 && (
        <div 
          className={cn(
            "absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4",
            "bg-white rounded-full shadow-2xl border border-gray-200 z-50 shadow-gray-500/20",
            "animate-in fade-in slide-in-from-top-4 duration-300",
          )}
        >
          <div className="text-sm">
            <span className="font-medium">{selectedRecipients.length} recipients selected</span>
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

      <div className={cn(
        "grid gap-6 transition-all duration-300",
        (hasSelectedRecipients || selectedRecipient) ? "grid-cols-[2fr,1fr]" : "grid-cols-1"
      )}>
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative w-64">
              <Input
                placeholder="Search recipients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-8"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center justify-between flex-1">
              <ToggleGroup 
                type="single" 
                value={recipientTypeFilter || ''} 
                onValueChange={(value) => setRecipientTypeFilter(value || null)}
              >
                <ToggleGroupItem 
                  value="" 
                  aria-label="Show all recipients"
                  className={cn(
                    "text-xs px-3 py-1",
                    !recipientTypeFilter && "bg-gray-100"
                  )}
                >
                  All
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="business" 
                  aria-label="Show business recipients"
                  className={cn(
                    "text-xs px-3 py-1 gap-1",
                    recipientTypeFilter === 'business' && "bg-blue-50 text-blue-700"
                  )}
                >
                  <Building2 className="h-3 w-3" />
                  Business
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="personal" 
                  aria-label="Show personal recipients"
                  className={cn(
                    "text-xs px-3 py-1 gap-1",
                    recipientTypeFilter === 'personal' && "bg-purple-50 text-purple-700"
                  )}
                >
                  <UserPlus className="h-3 w-3" />
                  Personal
                </ToggleGroupItem>
              </ToggleGroup>

              <Button
                data-add-new-button
                onClick={() => {
                  setShowAddNew(prev => !prev)
                  setSelectedRecipient(null)
                }}
                className={cn(
                  "text-xs px-3 py-1 gap-1",
                  showAddNew && "bg-gray-100"
                )}
              >
                <UserPlus className="h-3 w-3" />
                Add New
              </Button>
            </div>
          </div>

          <div className="rounded-lg">
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
                        <p className="font-medium text-gray-900">No recipients yet</p>
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
        </div>

        {/* Right side card - either recipient details or payout form */}
        {mode === 'default' && selectedRecipient && (
          <div 
            ref={detailsCardRef}
            className="animate-in slide-in-from-right duration-300"
          >
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <RecipientDetails recipient={selectedRecipient} />
            </div>
          </div>
        )}

        {mode === 'payout' && hasSelectedRecipients && (
          <div className="animate-in slide-in-from-right duration-300">
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg">Payment Details</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Configure the payment details for {selectedRecipients.length} selected {pluralize(selectedRecipients.length, 'recipient')}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex -space-x-2">
                      {selectedRecipients.slice(0, 3).map((recipient, index) => (
                        <BlurImage 
                          key={recipient.id}
                          src={`${DICEBEAR_SOLID_AVATAR_URL}${recipient.name}`}
                          width={12}
                          height={12}
                          alt={recipient.name}
                          className="size-6 shrink-0 overflow-hidden rounded-full border-2 border-white"
                          style={{ zIndex: 3 - index }}
                        />
                      ))}
                    </div>
                    <div className={cn(
                      "text-sm text-gray-600 text-xs",
                      selectedRecipients.length > 2 && "px-2"
                    )}>
                      {selectedRecipients.slice(0, 3).map((recipient, index) => (
                        <span key={recipient.id}>
                          {index > 0 && index === Math.min(selectedRecipients.length, 3) - 1 && selectedRecipients.length <= 3 && " and "}
                          {index > 0 && index < Math.min(selectedRecipients.length, 4) - 1 && ", "}
                          {recipient.name}
                        </span>
                      ))}
                      {selectedRecipients.length > 3 && ` and ${selectedRecipients.length - 3} more`}
                    </div>
                  </div>

                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount per recipient</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Origin Account</Label>
                    <Select>
                      <SelectTrigger id="payment-method" className="w-full">
                        <SelectValue placeholder="Select origin account" />
                      </SelectTrigger>
                      <SelectContent className="bg-white p-0">
                        {subAccounts.map((subAccount) => (
                          <SelectItem key={subAccount.id} value={subAccount.id} className="w-full">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{subAccount.name}</span>
                                <span className="text-xs text-gray-500">
                                  {subAccount.accountNumber}
                                </span>
                              </div>

                              <div className="flex items-start justify-between gap-3 ">
                                <Badge 
                                  className={cn(
                                    "flex items-center gap-1 m-0.5",
                                    subAccount.status === 'active' 
                                      ? "bg-green-50 text-green-700 border-green-200" 
                                      : "bg-gray-50 text-gray-600 border-gray-200"
                                  )}
                                >
                                  <span className="size-1.5 rounded-full bg-current" />
                                  <span className="text-[10px] capitalize">{subAccount.status}</span>
                                </Badge>

                                <div className="flex flex-col items-end ">
                                  <div className="flex items-center gap-1">
                                    {subAccount.currency && CURRENCIES[subAccount.currency] && (
                                      <Image
                                        src={CURRENCIES[subAccount.currency]?.flag ?? ''}
                                        alt={CURRENCIES[subAccount.currency]?.name ?? ''}
                                        width={12}
                                        height={12}
                                        className="rounded-full object-cover size-3"
                                      />
                                    )}
                                    <span className="text-sm font-medium">
                                      {CURRENCIES[subAccount.currency]?.symbol}{subAccount.balance.toLocaleString()}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-gray-500">Available balance</span>
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Payment Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this payment..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount per recipient</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Number of recipients</span>
                      <span className="font-medium">{selectedRecipients.length}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total amount</span>
                      <span>$0.00</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6 group">
                    Continue to Review
                    <ExpandingArrow className="size-3 transition-all duration-300 ease-in-out" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
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
          <p className="text-base font-semibold">{recipient.name}</p>
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
                    src={recipient.bankingDetails?.currency?.flag}
                    alt={recipient.bankingDetails?.currency?.name}
                    width={16}
                    height={16}
                    className="rounded-full object-cover w-4 h-4"
                  />
                  <span className="text-xs text-gray-600">{recipient.bankingDetails?.currency?.name}</span>
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
          <Button variant="danger" className="p-2 text-xs">
            Remove Recipient
          </Button>
          <Button  className="ml-auto">
            Edit Details
          </Button>
        </div>
      </div>
    </div>
  )
}
