"use client"

import { useFixtures } from "@/fixtures/useFixtures"
import { useWalletStore } from "@/hooks/stores/wallet-store"
import { InstantBadge } from "@/ui/shared/badges/instant-badge"
import { StatusBadge } from "@/ui/shared/badges/status-badge"
import { USDCBadge } from "@/ui/shared/badges/usdc-badge"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { useWallet } from "@/wallet/useWallet"
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, ExpandingArrow, Separator } from "@freelii/ui"
import { cn, CURRENCIES, maskFirstDigits, noop } from "@freelii/utils"
import { USDC_SAC } from "@freelii/utils/constants"
import { fromStroops, toStroops } from "@freelii/utils/functions"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { ArrowDownRight, ArrowUpRight, ChevronDown, RefreshCw, Wallet } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

dayjs.extend(relativeTime)

interface TransactionDetails {
  id: string
  type: 'received' | 'sent'
  description: string
  amount: number
  date: string
  status: 'completed' | 'pending' | 'processing' | 'failed'
  currency: string
  reference: string
  sender?: string
  senderEmail?: string
  bankName?: string
  accountNumber?: string
  failureReason?: string
}

function TransactionDetails({
  transaction,
  onClose
}: {
  transaction: TransactionDetails
  onClose: () => void
}) {
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Ignore clicks on the transaction rows
      if (event.target instanceof Element && event.target.closest('[data-transaction-row]')) {
        return
      }

      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <div ref={detailsRef} className="fixed-width p-4 border-l border-gray-200 h-full overflow-y-auto">
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <StatusBadge text={transaction.status} useIcon />
            <div className="text-sm text-gray-500">
              {dayjs(transaction.date).format('MMM D, YYYY')}
            </div>
          </div>

          <div>
            <h3 className="font-medium">{transaction.description}</h3>
            <div className="text-sm text-gray-500">Reference: {transaction.reference}</div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Amount</div>
            <div className="flex items-center gap-2">
              <FlagIcon currencyCode={transaction.currency} size={16} />
              <div className="text-lg font-semibold">
                {CURRENCIES[transaction.currency]?.symbol}
                {transaction.amount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Transaction Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Transaction Details</h4>

          {transaction.type === 'received' && (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">From</div>
                <div className="font-medium">{transaction.sender}</div>
                <div className="text-sm text-gray-500">{transaction.senderEmail}</div>
              </div>
            </div>
          )}

          {transaction.type === 'sent' && (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">To Bank</div>
                <div className="font-medium">{transaction.bankName}</div>
                <div className="text-sm text-gray-500">Account ending in {transaction.accountNumber?.slice(-4)}</div>
              </div>
            </div>
          )}

          {transaction.status === 'failed' && (
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-sm text-red-700">
                <div className="font-medium">Failed</div>
                <div>{transaction.failureReason}</div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Timeline */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Timeline</h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="relative flex flex-col items-center">
                <div className="size-2 rounded-full bg-green-600" />
                <div className="flex-1 w-px bg-gray-200" />
              </div>
              <div>
                <div className="text-sm font-medium">Transaction initiated</div>
                <div className="text-xs text-gray-500">{dayjs(transaction.date).format('MMM D, YYYY [at] h:mm A')}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative flex flex-col items-center">
                <div className={cn(
                  "size-2 rounded-full",
                  transaction.status === 'completed'
                    ? 'bg-green-600'
                    : transaction.status === 'processing'
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                )} />
              </div>
              <div>
                <div className="text-sm font-medium">
                  {transaction.status === 'completed' && 'Transaction completed'}
                  {transaction.status === 'processing' && 'Processing'}
                  {transaction.status === 'failed' && 'Transaction failed'}
                </div>
                <div className="text-xs text-gray-500">
                  {transaction.status === 'completed' && dayjs(transaction.date).add(transaction.currency === 'USDC' ? 0 : 15, 'minute').format('MMM D, YYYY [at] h:mm A')}
                  {transaction.status === 'processing' && 'In progress...'}
                  {transaction.status === 'failed' && transaction.failureReason}
                  {transaction.currency === 'USDC' && <InstantBadge className="bg-green-50 text-xs ml-2 text-green-700 border-green-200" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PageClient() {
  const { usdcAccount, getBalance, fiatAccounts, transactions } = useFixtures()
  const { account, fundWallet, transfer, isFunding } = useWallet();
  const { wallets } = useWalletStore();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null)
  const [isTransferring, setIsTransferring] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState('')

  const handleTransactionClick = (transaction: TransactionDetails) => {
    // Toggle details if clicking the same transaction
    if (selectedTransaction?.id === transaction.id) {
      setSelectedTransaction(null)
    } else {
      setSelectedTransaction(transaction)
    }
  }

  const handleInternalTransfer = async () => {
    if (!selectedRecipient) return
    setIsTransferring(true)
    try {
      console.log('selectedRecipient', selectedRecipient)
      const address = wallets.find(wallet => wallet.id === selectedRecipient)?.address;
      if (!address) {
        throw new Error('No address found')
      }
      await transfer({
        to: address,
        amount: toStroops(1),
        sacAddress: USDC_SAC
      })
    } finally {
      setIsTransferring(false)
      setSelectedRecipient('')
    }
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Balance & Withdrawal Options */}
        <div className={cn(
          "transition-all duration-300 space-y-6 col-span-4"
        )}>
          {/* Balance Card */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="space-y-4">
              {/* Balance Section */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wallet className="size-4 text-gray-500" />
                  <span className="font-medium text-sm">Main Account</span>
                </div>
                <div className="text-2xl font-semibold">
                  {CURRENCIES.USDC?.symbol}
                  {fromStroops(account?.mainBalance?.amount, 2)}
                </div>
                <div className="text-sm text-gray-500">Available balance {fromStroops(account?.balances?.find(b => b.currency === 'XLM')?.amount, 2)}</div>
                <Button disabled={isFunding} variant="outline" className="text-xs" onClick={() => fundWallet(account?.address)}>
                  <Wallet className="size-3 mr-2" />
                  <span>{isFunding ? 'Funding...' : 'Add Funds'}</span>
                </Button>
                <Button variant="outline" className="text-xs" onClick={() => transfer({ to: 'GDUDPV3UBLHL2ZUC7XTERLVE5LPFNRK4DOU3GFM7U4AJEB3L7UMH3PPW', amount: 1 })}>
                  <Wallet className="size-3 mr-2" />
                  <span>Quick Transfer</span>
                </Button>
                <Button variant="outline" className="text-xs" onClick={() => transfer({ to: 'GDUDPV3UBLHL2ZUC7XTERLVE5LPFNRK4DOU3GFM7U4AJEB3L7UMH3PPW', amount: toStroops(1), sacAddress: USDC_SAC })}>
                  <span>Transfer USDC</span>
                </Button>
              </div>

              <Separator />

              {/* Account Details */}
              <div className="space-y-3 ">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Account Type</div>
                    <div className="font-medium">Digital Currency Account</div>
                  </div>
                  <USDCBadge className="bg-blue-50 text-blue-700 border-blue-200" />
                </div>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                    <ChevronDown
                      className="size-4 transition-transform duration-200 [data-state=open]:rotate-180"
                    />
                    Network Details
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-2">
                    {/* Blockchain & Network Info */}
                    <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Asset</div>
                        <div className="flex items-center gap-2">
                          <USDCBadge className="bg-blue-50 text-blue-700 border-blue-200" />
                          <span className="text-xs text-gray-500">
                            Circle USD Coin
                          </span>
                        </div>
                      </div>
                    </div>


                    {/* Last Updated & Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">Last Updated</div>
                        <Button
                          variant="ghost"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            // TODO: Implement balance refresh
                            getBalance().then(noop).catch(noop)
                          }}
                        >
                          <RefreshCw className="size-3" />
                          Update now
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {dayjs(usdcAccount.lastUpdated).fromNow()}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        Your funds are held as USDC on the {usdcAccount.blockchain} network,
                        ensuring fast and cost-effective transactions while maintaining full
                        regulatory compliance.
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="space-y-2">
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Select recipient account</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.alias}
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  className="text-xs w-full"
                  disabled={!selectedRecipient || isTransferring}
                  onClick={handleInternalTransfer}
                >
                  <Wallet className="size-3 mr-2" />
                  <span>{isTransferring ? 'Transferring...' : 'Transfer Between Accounts'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Withdrawal Options */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-4">Available Withdrawal Options</h3>
            <div className="space-y-3">
              {fiatAccounts.map((account) => (
                <div key={account.id} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FlagIcon currencyCode={account.currency} size={20} />
                        <div>
                          <div className="font-medium">{account.currency}</div>
                          <div className="text-sm text-gray-500">{account.bank_name}</div>
                          <div className="text-xs text-gray-500">{maskFirstDigits(account.account_number)}</div>
                        </div>
                      </div>

                    </div>

                    <Link href={`/dashboard/withdrawals/request?to=${account.id}`}>
                      <Button
                        variant="outline"
                        className="group text-xs px-6 pl-3 py-2 flex items-center gap-2"
                      >
                        Withdraw
                        <ExpandingArrow className="size-4 -ml-2" />
                        <FlagIcon
                          currencyCode={account.currency}
                          className="ml-2 transition-transform duration-200 group-hover:scale-110 group-hover:brightness-110"
                        />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Transactions */}
        <div className={cn(
          "transition-all duration-300",
          selectedTransaction ? "col-span-8 grid grid-cols-[1.5fr,1fr] gap-6" : "col-span-8"
        )}>
          {/* Recent Transactions */}
          <div className="p-4 border border-gray-200 rounded-lg h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Recent Transactions</h3>
              {/* <Link href="/dashboard/transactions">
                <Button variant="outline">
                  View All
                </Button>
              </Link> */}
            </div>

            <div className="">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  data-transaction-row
                  onClick={() => handleTransactionClick(transaction)}
                  className={cn(
                    "cursor-pointer hover:bg-gray-50 rounded-lg transition-colors",
                    selectedTransaction?.id === transaction.id && "bg-gray-50"
                  )}
                >
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${transaction.type === 'received'
                        ? 'bg-green-50'
                        : transaction.status === 'failed'
                          ? 'bg-red-50'
                          : 'bg-blue-50'
                        }`}>
                        {transaction.type === 'received' ? (
                          <ArrowDownRight className="size-3.5 text-green-600" />
                        ) : (
                          <ArrowUpRight className={`size-3.5 ${transaction.status === 'failed'
                            ? 'text-red-600'
                            : 'text-blue-600'
                            }`} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {transaction.description}
                          {transaction.currency === 'USDC' && (
                            <InstantBadge className="bg-green-50 text-green-700 border-green-200 gap-1 flex items-center py-0 h-4" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          {dayjs(transaction.date).format('MMM D, YYYY [at] h:mm A')}
                          <span className="text-gray-300">•</span>
                          <span>{transaction.reference}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium flex items-center gap-1 justify-end">
                          <FlagIcon currencyCode={transaction.currency} size={12} />
                          {CURRENCIES[transaction.currency]?.symbol}
                          {transaction.amount.toLocaleString()}
                        </div>
                        <StatusBadge text={transaction.status} useIcon />
                      </div>
                    </div>
                  </div>
                  <Separator className="mt-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Details */}
          {selectedTransaction && (
            <div key={selectedTransaction.id} className="h-full">
              <TransactionDetails
                transaction={selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = `
  .fixed-width {
    width: 100%;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-in {
    animation: fade-in 0.2s ease-out;
  }
`;
