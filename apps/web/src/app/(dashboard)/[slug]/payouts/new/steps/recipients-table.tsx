"use client"

import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler"
import { api } from "@/trpc/react"
import { XLMIcon } from "@/ui/icons/xlm-icon"
import { recipientFormatter } from "@/ui/recipients-table/recipient-formatter"
import { Recipient, RecipientsTable } from "@/ui/recipients-table/recipients-table"
import { USDCBadge } from "@/ui/shared/badges/usdc-badge"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { useWallet } from "@/wallet/useWallet"
import {
  Badge, BlurImage, Button,
  ExpandingArrow,
  Input, Label, Logo,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
  ToggleGroup, ToggleGroupItem,
  useRouterStuff
} from "@freelii/ui"
import { cn, CURRENCIES, DICEBEAR_SOLID_AVATAR_URL, shortAddress } from "@freelii/utils"
import { BlockchainAccount, Client, FiatAccount, RecipientType } from "@prisma/client"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Building2, CheckCircle2, Search, UserPlus, X } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useRef } from "react"
import toast from "react-hot-toast"

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
  const [selectedAccount, setSelectedAccount] = React.useState<string | null>(null)

  // tRPC procedures
  const trpcUtils = api.useUtils()
  const removeRecipient = api.clients.archive.useMutation({
    onError: ClientTRPCErrorHandler,
    onSuccess: () => {
      void trpcUtils.clients.search.invalidate()
    }
  })
  const { data: clients, isFetching: loading } = api.clients.search.useQuery({
    query: searchQuery,
    page: 1,
    limit: 10
  });


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
    if (searchParams.get('recipientAccount')) {
      const recipientAccount = searchParams.get('recipientAccount')
      setSelectedAccount(recipientAccount)
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

  const handleRemoveRecipient = async (id: number) => {
    await removeRecipient.mutateAsync({ id })
    void trpcUtils.clients.search.invalidate()
    setSelectedRecipient(null)
    toast.success('Recipient archived')
  }


  // Helper function to get account details
  const getSelectedAccountDetails = () => {
    if (!selectedAccount) return null
    if (selectedAccount === 'freelii') return { type: 'freelii' }

    const fiatAccount = selectedRecipient?.fiat_accounts?.find(acc => acc.id === selectedAccount)
    if (fiatAccount) return { type: 'fiat', details: fiatAccount }

    const blockchainAccount = selectedRecipient?.blockchain_accounts?.find(acc => acc.id === selectedAccount)
    if (blockchainAccount) return { type: 'blockchain', details: blockchainAccount }

    return null
  }

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
                  value={RecipientType.BUSINESS}
                  aria-label="Show business recipients"
                  className={cn(
                    "text-xs px-3 py-1 gap-1",
                    recipientTypeFilter === RecipientType.BUSINESS && "bg-blue-50 text-blue-700"
                  )}
                >
                  <Building2 className="h-3 w-3" />
                  Business
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={RecipientType.INDIVIDUAL}
                  aria-label="Show personal recipients"
                  className={cn(
                    "text-xs px-3 py-1 gap-1",
                    recipientTypeFilter === RecipientType.INDIVIDUAL && "bg-purple-50 text-purple-700"
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
                if (row) {
                  queryParams({ set: { recipientId: row.id.toString() } })
                }
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
              <RecipientDetails recipient={selectedRecipient} onRemove={handleRemoveRecipient} />
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
                      <Select
                        value={selectedAccount ?? undefined}
                        onValueChange={(value) => {
                          queryParams({ set: { recipientAccount: value } })
                        }}
                      >
                        <SelectTrigger className="w-full mt-3 bg-gray-50 rounded-md">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedRecipient?.fiat_accounts?.map((account) => (
                            <SelectItem key={account.id} value={account.id} className="py-2 bg-white">
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <span className="flex text-sm">{account.bank_name}
                                    <Badge className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {account.iso_currency}
                                    </Badge>
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {account.account_number}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                          {selectedRecipient?.blockchain_accounts?.map((account) => (
                            <SelectItem key={account.id} value={account.id} className="py-2 bg-white">
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <span className="flex text-sm">{account.network}
                                    <Badge className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {account.network}
                                    </Badge>
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {shortAddress(account.address)}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="freelii" className="py-2 bg-white">
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

                      {/* Update the account details preview */}
                      {selectedAccount && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs space-y-2">
                          {(() => {
                            const accountDetails = getSelectedAccountDetails()

                            switch (accountDetails?.type) {
                              case 'freelii':
                                return (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Destination Account</span>
                                      <span className="font-medium">Freelii USDC Account</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Account</span>
                                      <span>Digital Currency Account</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Currency</span>
                                      <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        USDC
                                      </Badge>
                                    </div>
                                  </>
                                )

                              case 'fiat':
                                return (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Bank</span>
                                      <span className="font-medium">{(accountDetails?.details as FiatAccount)?.bank_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Account</span>
                                      <span className="font-medium">
                                        ••••{(accountDetails?.details as FiatAccount)?.account_number.slice(-4)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Currency</span>
                                      <div className="flex items-center gap-1.5">
                                        <FlagIcon
                                          currencyCode={(accountDetails?.details as FiatAccount)?.iso_currency}
                                          size={14}
                                        />
                                        <span className="font-medium">
                                          {(accountDetails?.details as FiatAccount)?.iso_currency}
                                        </span>
                                      </div>
                                    </div>
                                  </>
                                )

                              case 'blockchain':
                                return (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Network</span>
                                      <span className="font-medium">{(accountDetails?.details as BlockchainAccount)?.network}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Address</span>
                                      <span className="font-medium">
                                        {shortAddress((accountDetails?.details as BlockchainAccount)?.address)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Settlement</span>
                                      <Badge className="text-xs bg-green-50 text-green-700 border-green-200">
                                        Instant
                                      </Badge>
                                    </div>
                                  </>
                                )

                              default:
                                return (
                                  <div className="text-gray-500">
                                    No account details available
                                  </div>
                                )
                            }
                          })()}
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
                          onClick={() => window.location.href = '/dashboard/recipients/new?from=payments'}
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
  onRemove: (id: number) => void
}

function RecipientDetails({ recipient, onRemove }: RecipientDetailsProps) {
  return (
    <div className="transition-opacity duration-200 delay-150 opacity-100">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold">{recipient.name}</p>

        </div>
        <p className="text-xs text-gray-500">{recipient.email}</p>
      </div>

      <div className="space-y-6">
        {/* Fiat Accounts Section */}
        {recipient.fiat_accounts && recipient.fiat_accounts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Bank Accounts</h3>
            <div className="space-y-2">
              {recipient.fiat_accounts.map((account) => (
                <div key={account.id} className="p-3 bg-gray-50 rounded-md space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      {account.bank_name}
                      <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 px-1.5 py-0.5">
                        <FlagIcon
                          currencyCode={account.iso_currency}
                          size={14}
                        />
                        {account.iso_currency}
                      </Badge>
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Account: ••••{account.account_number.slice(-4)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blockchain Accounts Section */}
        {recipient.blockchain_accounts && recipient.blockchain_accounts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Digital Accounts</h3>
            <div className="space-y-2">
              {recipient.blockchain_accounts.map((account) => (
                <div key={account.id} className="p-3 bg-gray-50 rounded-md space-y-1">
                  <span className="text-sm font-medium flex items-center gap-1 w-full justify-between">
                    Digital US Dollar <USDCBadge />
                  </span>
                  <Link href={`https://stellar.expert/explorer/testnet/contract/${account.address}`}>
                    <span className="px-2 pr-6 inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200">
                      <XLMIcon className="h-3 w-3 mr-2" />
                      {shortAddress(account.address)}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="danger" className="p-2 text-xs" onClick={() => onRemove(recipient.id)}>
            Remove Recipient
          </Button>
        </div>
      </div>
    </div>
  )
}

