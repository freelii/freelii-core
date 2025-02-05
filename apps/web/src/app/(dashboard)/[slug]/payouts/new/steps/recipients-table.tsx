"use client"

import { api } from "@/trpc/react"
import { recipientFormatter } from "@/ui/recipients-table/recipient-formatter"
import { Recipient, RecipientsTable } from "@/ui/recipients-table/recipients-table"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { useWallet } from "@/wallet/useWallet"
import {
  Badge, BlurImage, Button,
  ExpandingArrow,
  IconMenu, Input, Label, Logo, Popover,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea, ThreeDots, ToggleGroup, ToggleGroupItem,
  useRouterStuff
} from "@freelii/ui"
import { cn, CURRENCIES, DICEBEAR_SOLID_AVATAR_URL } from "@freelii/utils"
import { Client } from "@prisma/client"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Building2, CheckCircle2, ClipboardCopy, Clock, CreditCard, Search, UserPlus, X } from "lucide-react"
import React, { useEffect, useRef } from "react"

dayjs.extend(relativeTime)

type RecipientsTableProps = {
  mode?: 'default' | 'payout'
  onNext?: () => void
  onBack?: () => void
}

export default function NewPayment({ mode = 'default', onNext, onBack }: RecipientsTableProps) {
  const { queryParams, searchParams } = useRouterStuff()
  const { account } = useWallet();

  const [selectedRecipient, setSelectedRecipient] = React.useState<Recipient | null>(null)
  const detailsCardRef = useRef<HTMLDivElement>(null)
  const [recipientTypeFilter, setRecipientTypeFilter] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [amount, setAmount] = React.useState<string>(searchParams.get('amount') ?? '')

  // tRPC procedures
  const { data: clients, isFetching: loading } = api.clients.search.useQuery({
    query: searchQuery,
    page: 1,
    limit: 10
  });

  // Hardcoded for DEMO
  const transferToFreelii = searchParams.get('transferToFreelii') === 'true';

  // Initialize from URL params only once

  const filteredRecipients = React.useMemo(() => {
    let filtered: Array<Client> = clients ?? [];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by recipient type
    if (recipientTypeFilter) {
      filtered = filtered.filter(client => String(client.recipient_type) === recipientTypeFilter)
    }

    return filtered
  }, [clients, recipientTypeFilter, searchQuery])


  useEffect(() => {
    if (searchParams.get('recipientId')) {
      const recipientId = searchParams.get('recipientId')
      const recipient = filteredRecipients?.find(recipient => recipient.id === parseInt(recipientId!, 10))
      if (recipient) {
        setSelectedRecipient(recipientFormatter(recipient))
      }
    }
  }, [searchParams, filteredRecipients])

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

          <RecipientsTable recipients={filteredRecipients.map(recipientFormatter)}
            loading={loading}
            selectedRecipient={selectedRecipient}
            onRecipientSelect={(row) => {
              if (selectedRecipient?.id === row?.id) {
                setSelectedRecipient(null)
                queryParams({ del: ['recipientId'] })
              } else {
                setSelectedRecipient(row)
                row && queryParams({ set: { recipientId: row.id.toString() } })
              }
            }}
            searchQuery={searchQuery} />
        </div>

        {/* Right side panel */}
        {mode === 'default' && selectedRecipient && (
          <div
            ref={detailsCardRef}
            className="animate-in slide-in-from-right duration-300"
          >
            <div className="p-6 bg-white h-full border-l border-gray-200">
              <RecipientDetails recipient={selectedRecipient} />
            </div>
          </div>
        )}

        {/* Payment details panel - always shown in payout mode */}
        {mode === 'payout' && (
          <div className="animate-in slide-in-from-right duration-300">
            <div className="p-6 bg-white border-l border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg">New Payment</h3>
                  {selectedRecipient ? (
                    <>
                      <div className="flex items-center gap-2 mt-3 animate-in fade-in duration-300">
                        <div className="flex -space-x-2">
                          <BlurImage
                            key={selectedRecipient.id}
                            src={`${DICEBEAR_SOLID_AVATAR_URL}${selectedRecipient.name}`}
                            width={24}
                            height={24}
                            alt={selectedRecipient.name}
                            className="size-6 shrink-0 overflow-hidden rounded-full border-2 border-white"
                          />
                        </div>
                        <div className="text-sm text-gray-600 flex-col flex">
                          <span>{selectedRecipient.name}</span>
                          <span className="text-xs text-gray-500">{selectedRecipient.email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-gray-500 hover:text-gray-900"
                          onClick={() => {
                            queryParams({ del: ['recipientId'] })
                            setSelectedRecipient(null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
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
                                </div>
                                <span className="text-xs text-gray-500">
                                  ••••{selectedRecipient.bankingDetails.accountNumber.slice(-4)}
                                </span>
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
                              </div>
                              <span className="text-xs text-gray-500">Instant settlement</span>
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
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <div className="relative flex-1">
                            {account && (
                              <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-gray-200 pr-4 pl-2 py-2 rounded-l-md">
                                <FlagIcon
                                  currencyCode={account.main_balance?.currency}
                                  size={16}
                                />
                                <span className="text-sm text-gray-500">
                                  {CURRENCIES[account.main_balance?.currency ?? 'USDC']?.symbol}
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
                            <span className="flex items-center gap-1">
                              <FlagIcon
                                currencyCode={account?.main_balance?.currency}
                                size={16}
                              />
                              {Number(amount).toLocaleString('en-US', {
                                style: 'currency',
                                currency: !!account?.main_balance?.currency &&
                                  account?.main_balance?.currency === 'USDC' ?
                                  'USD'
                                  : account?.main_balance?.currency ?? 'USD'
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
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-300">
                      <div className="rounded-full bg-gray-50 p-3 mb-4">
                        <UserPlus className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">No recipient selected</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Select a recipient from the list to configure payment details
                      </p>
                      {filteredRecipients.length > 0 &&
                        <Button
                          className="mt-4"
                          onClick={() => window.location.href = '/dashboard/recipients/new'}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          New Recipient
                        </Button>}
                      <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Send to bank accounts</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Send to Freelii accounts</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>


              </div>
            </div>
          </div>
        )}
      </div>
    </div >
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
