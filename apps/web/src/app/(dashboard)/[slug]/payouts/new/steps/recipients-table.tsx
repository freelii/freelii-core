"use client"

import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler"
import { api } from "@/trpc/react"
import { WalletDropdown } from "@/ui/layout/sidebar/wallet-dropdown"
import { Recipient, RecipientsTable } from "@/ui/recipients-table/recipients-table"
import { useWallet } from "@/wallet/useWallet"
import {
  BlurImage,
  Button,
  ExpandingArrow,
  Input,
  Label,
  LoadingDots,
  Separator,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  useRouterStuff
} from "@freelii/ui"
import { cn, CURRENCIES, DICEBEAR_SOLID_AVATAR_URL } from "@freelii/utils"
import { Client, RecipientType } from "@prisma/client"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Building2, CheckCircle2, Search, UploadIcon, UserPlus, X } from "lucide-react"
import React, { useEffect, useRef } from "react"
import toast from "react-hot-toast"
import { AccountDetails } from "./account-details"

dayjs.extend(relativeTime)

type RecipientsTableProps = {
  mode?: 'default' | 'payout'
  onNext?: () => void
  onBack?: () => void
}

export default function NewPayment({ mode = 'default', onNext, onBack }: RecipientsTableProps) {
  const { queryParams, searchParams, router } = useRouterStuff()
  const { account } = useWallet();

  const [selectedRecipient, setSelectedRecipient] = React.useState<Recipient | null>(null)
  const detailsCardRef = useRef<HTMLDivElement>(null)
  const [recipientTypeFilter, setRecipientTypeFilter] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [amount, setAmount] = React.useState<string>(searchParams?.get('amount') ?? '')
  const [selectedAccount, setSelectedAccount] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // tRPC procedures
  const initiatePayment = api.orchestrator.initiatePayment.useMutation({
    onError: ClientTRPCErrorHandler,
    onSuccess: (data) => {
      if (data.success) {
        void router.push(`/dashboard/payouts/${data.state.id}`)
      } else {
        toast.error(data.error ?? 'Failed to initiate payment')
      }
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
    if (searchParams?.get('recipientId')) {
      const recipientId = searchParams.get('recipientId')
      const recipient = filteredRecipients?.find(recipient => recipient.id === parseInt(recipientId!, 10))
      if (recipient) {
        setSelectedRecipient(recipient)
        const paymentDestination = recipient?.payment_destinations[0];
        setSelectedAccount(paymentDestination?.id);
        queryParams({ set: { recipientAccount: paymentDestination?.id } })
      }
    }
    // if (searchParams.get('recipientAccount')) {
    //   if (!selectedAccount) {
    //     const recipientAccount = searchParams.get('recipientAccount')
    //     setSelectedAccount(recipientAccount)
    //   }
    // }
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

  const handleInitiatePayment = async () => {
    if (selectedRecipient && amount && selectedAccount && account) {
      setIsSubmitting(true)
      await initiatePayment.mutateAsync({
        sourceAmount: Number(amount),
        recipientId: selectedRecipient.id,
        destinationId: selectedAccount,
        walletId: account.id
      }).finally(() => {
        setIsSubmitting(false)
      })
    } else {
      toast.error('Please select a recipient, amount, and account');
    }
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

              <Button
                variant="outline"
                className="text-xs gap-2"
                onClick={() => {
                  queryParams({ set: { import: 'csv' } })
                }}
              >
                <UploadIcon className="h-3.5 w-3.5" />
                Load from CSV
              </Button>
            </div>
          </div>

          <RecipientsTable
            recipients={filteredRecipients}
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
        {/* Payment details panel - always shown in payout mode */}
        {mode === 'payout' && (
          <div className="-translate-y-10">
            <div className="p-6 bg-white border-l border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg">Payment Details</h3>
                  <Separator className="my-3" />
                  <Label>Sending from</Label>
                  <WalletDropdown />
                  <Separator className="my-3" />
                  {selectedRecipient ? (
                    <>
                      <Label>Sending to</Label>
                      <div className="flex items-center justify-between gap-2 mt-3 animate-in fade-in duration-300 bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          <BlurImage
                            key={selectedRecipient.id}
                            src={`${DICEBEAR_SOLID_AVATAR_URL}${selectedRecipient.name}`}
                            width={24}
                            height={24}
                            alt={selectedRecipient.name}
                            className="size-6 shrink-0 overflow-hidden rounded-full border-2 border-white"
                          />
                          <div className="text-sm text-gray-600 flex-col flex">
                            <span>{selectedRecipient.name}</span>
                            <span className="text-xs text-gray-500">{selectedRecipient.email}</span>
                          </div>
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

                      <Label>Destination Account</Label>

                      {/* Switch Bank Account */}
                      {/* <Select
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
                        </SelectContent>
                      </Select> */}

                      {/* Update the account details preview */}
                      <AccountDetails selectedAccount={
                        selectedRecipient.payment_destinations?.find(account => account.id === selectedAccount) ??
                        null
                      } />


                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <div className="relative flex-1">
                            {account && (
                              <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-gray-200 pr-4 pl-2 py-2 rounded-l-md">
                                {/* <FlagIcon
                                  currencyCode={account.main_balance?.currency}
                                  size={16}
                                /> */}
                                <span className="text-sm text-gray-500 font-medium ml-1">
                                  {CURRENCIES[account.main_balance?.currency ?? 'USDC']?.symbol}
                                </span>
                              </div>
                            )}
                            <Input
                              id="amount"
                              type="number"
                              placeholder="0.00"
                              className="pl-12 hover:border-gray-200 focus:border-none"
                              value={amount}
                              onChange={(e) => {
                                e.preventDefault();
                                const value = e.target.value;
                                setAmount(value);
                                // Update URL without causing a scroll/navigation
                                const newParams = new URLSearchParams(searchParams ?? '');
                                newParams.set('amount', value);
                                window.history.replaceState(null, '', `?${newParams.toString()}`);
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
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <div className="space-y-3">
                          {amount && <div className="flex justify-between text-sm font-medium">
                            <span>Amount</span>
                            <span className="flex items-center gap-1">
                              {/* <FlagIcon
                                currencyCode={account?.main_balance?.currency}
                                size={16}
                              /> */}
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
                          className="w-full mt-6 group h-8"
                          disabled={!amount || !selectedRecipient}
                          onClick={handleInitiatePayment}
                        >
                          {isSubmitting ? <LoadingDots color="white" /> : <>
                            Continue to Review
                            <ExpandingArrow className="size-3 transition-all duration-300 ease-in-out" />
                          </>}
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
                      <div className="mt-6 flex flex-col items-start gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>Send to bank accounts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>Send to blockchain accounts</span>
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


