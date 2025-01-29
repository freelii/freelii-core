"use client"

import { useFixtures } from "@/fixtures/useFixtures"
import { FlagIcon } from "@/ui/shared/flag-icon"
import {
  Badge, BlurImage, Button,
  ExpandingArrow, HoverCard,
  HoverCardContent,
  HoverCardTrigger, IconMenu, Input, Label, Popover,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea, ThreeDots, ToggleGroup, ToggleGroupItem,
  useRouterStuff
} from "@freelii/ui"
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
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState
} from "@tanstack/react-table"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Building2, CheckCircle2, ClipboardCopy, Clock, CreditCard, Search, UserPlus } from "lucide-react"
import Link from "next/link"
import { Logo } from "node_modules/@freelii/ui/src/logo"
import React, { useEffect, useRef } from "react"

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
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       onClick={(e) => e.stopPropagation()}
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
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
              {bankingDetails?.currency && (
                <FlagIcon
                  currencyCode={bankingDetails.currency.shortName}
                  size={16}
                />
              )}
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
    cell: (row) => <ActionCell />
  },
]

type RecipientsTableProps = {
  mode?: 'default' | 'payout'
  onNext?: () => void
  onBack?: () => void
}

export default function RecipientsTable({ mode = 'default', onNext, onBack }: RecipientsTableProps) {
  const { getRecipients } = useFixtures()
  const { queryParams, searchParams } = useRouterStuff()

  const [recipients, setRecipients] = React.useState<Recipient[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [selectedRecipient, setSelectedRecipient] = React.useState<Recipient | null>(null)
  const detailsCardRef = useRef<HTMLDivElement>(null)
  const [recipientTypeFilter, setRecipientTypeFilter] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCurrency] = React.useState<string>("USD")
  const [amount, setAmount] = React.useState<string>(searchParams.get('amount') ?? '')

  // Hardcoded for DEMO
  const transferToFreelii = searchParams.get('transferToFreelii') === 'true';

  // Initialize from URL params only once

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

  const TableComponent = useReactTable({
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
              currency: currencyCode ? CURRENCIES[currencyCode] : undefined
            }
          }
        }
        return recipient
      })
      setRecipients(recipientsWithMappedCurrencies as Recipient[])
      setLoading(false)
    }).catch(noop)
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
    <div className="w-full relative space-y-6 pb-10">

      <div className={cn(
        "grid gap-6 transition-all duration-300",
        mode === 'payout' ? "grid-cols-[2fr,1fr]" : // Always show 2-column layout in payout mode
          selectedRecipient ? "grid-cols-[2fr,1fr]" : "grid-cols-1"
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
                value={recipientTypeFilter ?? ''}
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
            </div>
          </div>

          <div className="rounded-lg">
            <Table className="border-none relative">
              <TableHeader className="border-none">
                {TableComponent.getHeaderGroups().map((headerGroup) => (
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
                ) : TableComponent.getRowModel().rows?.length ? (
                  TableComponent.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        "cursor-pointer hover:bg-gray-50 relative",
                        selectedRecipient?.id === row.original.id && "rounded-full bg-gray-50 after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:border-8 after:border-transparent after:border-r-gray-200",
                      )}
                      onClick={() => {
                        setSelectedRecipient(
                          selectedRecipient?.id === row.original.id ? null : row.original
                        )
                        queryParams({ set: { recipientId: row.original.id.toString() } })
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="font-normal text-xs p-1">
                          <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
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
                        <p className="font-medium text-gray-900">{(searchQuery) ? "No recipients found" : "No recipients yet"}</p>
                        <p className="text-sm text-gray-500">{(searchQuery) ? "Add a new recipient to get started." : "Get started by adding your first recipient."}</p>
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

        {/* Right side panel */}
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

        {/* Payment details panel - always shown in payout mode */}
        {mode === 'payout' && (
          <div className="animate-in slide-in-from-right duration-300">
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg">New Payment</h3>
                  {selectedRecipient ? (
                    <>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex -space-x-2">
                          <BlurImage
                            key={selectedRecipient.id}
                            src={`${DICEBEAR_SOLID_AVATAR_URL}${selectedRecipient.name}`}
                            width={12}
                            height={12}
                            alt={selectedRecipient.name}
                            className="size-6 shrink-0 overflow-hidden rounded-full border-2 border-white"
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>{selectedRecipient.name}</span>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <Label>Destination Account</Label>

                      {/* Switch Bank Account */}
                      <Select defaultValue={transferToFreelii ? "usdc" : "bank"} onValueChange={(value) => {
                        if (value === "usdc") {
                          queryParams({ set: { transferToFreelii: "true" } })
                        } else {
                          queryParams({ set: { transferToFreelii: "false" } })
                        }
                      }}>
                        <SelectTrigger className="w-full mt-3 bg-gray-50 rounded-md">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedRecipient.bankingDetails && (
                            <SelectItem value="bank" className="py-2 bg-white">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-500" />
                                <div className="flex flex-col">
                                  <span className="text-sm">{selectedRecipient.bankingDetails.bankName}</span>
                                  <span className="text-xs text-gray-500">
                                    ••••{selectedRecipient.bankingDetails.accountNumber.slice(-4)}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          )}
                          <SelectItem value="usdc" className="py-2 bg-white">
                            <div className="flex items-center gap-2">
                              <Logo className="h-4 w-4 text-gray-500 bg-gray-50 rounded-full" />
                              <div className="flex flex-col">
                                <span className="flex text-sm">Freelii Account
                                  <Badge className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    USDC
                                  </Badge>
                                </span>
                                <span className="text-xs text-gray-500">Instant settlement</span>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {transferToFreelii ? (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Destination Account</span>
                            <span className="font-medium">Freelii USDC Account</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Account</span>
                            Digital Currency Account

                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Currency</span>
                            <div className="flex items-center gap-1.5">
                              <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                USDC
                              </Badge>
                            </div>
                          </div>

                        </div>) : selectedRecipient.bankingDetails ? (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Bank</span>
                              <span className="font-medium">{selectedRecipient.bankingDetails.bankName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Account</span>
                              <span className="font-medium">
                                ••••{selectedRecipient.bankingDetails.accountNumber.slice(-4)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Currency</span>
                              <div className="flex items-center gap-1.5">
                                <FlagIcon
                                  currencyCode={selectedRecipient.bankingDetails.currency?.shortName}
                                  size={14}
                                />
                                <span className="font-medium">
                                  {selectedRecipient.bankingDetails.currency?.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs text-gray-500">
                          No banking details provided
                        </div>
                      )}
                    </>
                  ) : <p className="text-sm text-gray-500 mt-2">
                    Select a recipient to configure payment details
                  </p>}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative flex-1">
                      {selectedCurrency && (
                        <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-gray-200 pr-4 pl-2 py-2 rounded-l-md">
                          <FlagIcon
                            currencyCode={selectedCurrency}
                            size={16}
                          />
                          <span className="text-sm text-gray-500">
                            {CURRENCIES[selectedCurrency]?.symbol}
                          </span>
                        </div>
                      )}
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        className="pl-16 hover:border-gray-200 focus:border-none"
                        value={amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAmount(value);
                          queryParams({ set: { amount: value } });
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Payment Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this payment..."
                      className="resize-none hover:border-gray-500 focus:border-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="space-y-3">
                    {amount && <div className="flex justify-between text-sm font-medium">
                      <span>Amount</span>
                      <span>
                        {Number(amount).toLocaleString('en-US', {
                          style: 'currency',
                          currency: selectedCurrency === 'USDC' ? 'USD' : selectedCurrency,
                        })}
                      </span>
                    </div>}
                  </div>

                  <Button
                    className="w-full mt-6 group"
                    disabled={!amount || !selectedRecipient}
                    onClick={onNext}
                  >
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
                  {recipient.bankingDetails?.currency && (
                    <FlagIcon
                      currencyCode={recipient.bankingDetails.currency.shortName}
                      size={16}
                    />
                  )}
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
          <p className="text-xs text-gray-600">{recipient.notes ?? 'No notes provided'}</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="danger" className="p-2 text-xs">
            Remove Recipient
          </Button>
          <Button className="ml-auto">
            Edit Details
          </Button>
        </div>
      </div>
    </div>
  )
}

function ActionCell() {
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
}
