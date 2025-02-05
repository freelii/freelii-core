"use client"

import { useFixtures } from "@/fixtures/useFixtures"
import { useWalletStore } from "@/hooks/stores/wallet-store"
import { api } from "@/trpc/react"
import { USDCBadge } from "@/ui/shared/badges/usdc-badge"
import TransactionDetails, { ITransactionDetails } from "@/ui/transactions-table/transaction-details"
import TransactionsTable from "@/ui/transactions-table/transactions-table"
import { useWallet } from "@/wallet/useWallet"
import { Button, LoadingSpinner, useCopyToClipboard } from "@freelii/ui"
import { CURRENCIES } from "@freelii/utils"
import { USDC_SAC } from "@freelii/utils/constants"
import { fromStroops, shortAddress, toStroops } from "@freelii/utils/functions"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { ChevronDown, Copy, Menu, RefreshCw, X } from "lucide-react"
import { useState } from "react"

dayjs.extend(relativeTime)


export default function PageClient() {
  const { usdcAccount, transactions } = useFixtures()
  const { account, fundWallet, transfer, isFunding, isLoadingAccount } = useWallet();
  const [, copyToClipboard] = useCopyToClipboard();
  const { wallets } = useWalletStore();
  const [isTransferring, setIsTransferring] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<ITransactionDetails | null>(null)
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false)
  const [isNetworkDetailsOpen, setIsNetworkDetailsOpen] = useState(false)

  // tRPC procedures
  const trpcUtils = api.useUtils();
  const { data: txs, isLoading: isLoadingTx } = api.ledger.transactions.useQuery({
    walletId: String(account?.id)
  }, { enabled: !!account?.id })

  const refreshBalance = async () => {
    await trpcUtils.wallet.getAccount.invalidate();
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

  const handleTransactionClick = (transaction: ITransactionDetails) => {
    // Toggle details if clicking the same transaction
    if (selectedTransaction?.id === transaction.id) {
      setSelectedTransaction(null)
    } else {
      setSelectedTransaction(transaction)
    }
  }

  return (
    <div className="animate-in fade-in duration-500 mb-10">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Main Content */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Balance Overview Card */}
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Account Balance</h2>
                <p className="text-sm text-gray-500">Main Wallet</p>
              </div>
              <div className="flex items-center gap-3">
                <USDCBadge className="bg-blue-50 text-blue-700 border-blue-200" />
                <Button
                  variant="ghost"
                  onClick={() => setIsQuickActionsOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <span className="text-sm text-gray-500 flex items-center">Available Balance
                  {isLoadingAccount && (
                    <LoadingSpinner className="h-4 w-4 ml-2 text-gray-400" />
                  )}
                </span>
                <p className="text-3xl font-semibold mt-1">

                  {CURRENCIES.USDC?.symbol}
                  {fromStroops(account?.mainBalance?.amount, 2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">XLM Balance</p>
                <p className="text-3xl font-semibold mt-1">
                  {fromStroops(account?.balances?.find(b => b.currency === 'XLM')?.amount, 2)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button disabled={isFunding} variant="outline" onClick={() => fundWallet(account?.address)}>
                {isFunding ? 'Funding...' : 'Add Funds'}
              </Button>
              <Button variant="secondary" onClick={refreshBalance}>
                <RefreshCw className="size-3 mr-2" />
                Refresh Balance
              </Button>
            </div>
          </div>

          {/* Transactions Section */}
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
            </div>
            <TransactionsTable
              isLoading={isLoadingTx}
              transactions={transactions || []}
              onRowClick={handleTransactionClick}
              selectedRowId={selectedTransaction?.id}
            />
          </div>
        </div>

        {/* Right Column - Network Details (Desktop) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <div className="space-y-6">
              {/* Account Type Header */}
              <div>
                <div className="text-sm text-gray-500">Account Type</div>
                <div className="flex items-center justify-between mt-1">
                  <h2 className="text-xl font-semibold">Digital Currency Account</h2>
                  <USDCBadge className="bg-blue-50 text-blue-700 border-blue-200" />
                </div>
              </div>

              {/* Network Details Section */}
              <div>
                <button
                  onClick={() => setIsNetworkDetailsOpen(!isNetworkDetailsOpen)}
                  className="flex items-center gap-2 text-gray-700 w-full hover:text-gray-900 transition-colors"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isNetworkDetailsOpen ? 'rotate-180' : ''
                      }`}
                  />
                  <h3 className="text-sm font-medium">Network Details</h3>
                </button>

                {isNetworkDetailsOpen && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4 mt-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Account Address */}
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Account Address</div>
                      <div className="flex items-center gap-2 bg-white/50 p-2 rounded-md">
                        <code className="text-xs text-gray-600">{shortAddress(account?.address)}</code>
                        <Button
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => {
                            void copyToClipboard(account?.address);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-2">Asset</div>
                      <div className="flex items-center gap-2">
                        <USDCBadge className="bg-blue-50 text-blue-700 border-blue-200" />
                        <span className="text-sm">Circle USD Coin</span>
                      </div>
                    </div>

                    {/* Last Updated Section */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">Last Updated</div>
                        <Button
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={refreshBalance}
                        >
                          Update now
                        </Button>
                      </div>
                      <div className="text-sm mt-1">7 minutes ago</div>
                    </div>

                    {/* Description */}
                    <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                      Your funds are held as USDC on the {account?.network} network,
                      ensuring fast and cost-effective transactions while maintaining full
                      regulatory compliance.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Network Details Slide-over */}
      {isQuickActionsOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setIsQuickActionsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-[320px] bg-white shadow-lg z-30 lg:hidden animate-in slide-in-from-right">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setIsQuickActionsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Account Type Header */}
                <div>
                  <div className="text-sm text-gray-500">Account Type</div>
                  <div className="flex items-center justify-between mt-1">
                    <h2 className="text-xl font-semibold">Digital Currency Account</h2>
                    <USDCBadge className="bg-blue-50 text-blue-700 border-blue-200" />
                  </div>
                </div>

                {/* Account Address */}
                {account?.address && <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <p>Account Address:</p>
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                      <code className="text-xs text-gray-600">{shortAddress(account?.address)}</code>
                      <Button
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(String(account.address))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>}

                {/* Network Details Section */}
                <div>
                  <div className="flex items-center gap-2 text-gray-700 mb-4">
                    <ChevronDown className="h-4 w-4" />
                    <h3 className="text-sm font-medium">Network Details</h3>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Asset</div>
                      <div className="flex items-center gap-2">
                        <USDCBadge className="bg-blue-50 text-blue-700 border-blue-200" />
                        <span className="text-sm">Circle USD Coin</span>
                      </div>
                    </div>

                    {/* Last Updated Section */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">Last Updated</div>
                        <Button
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={refreshBalance}
                        >
                          Update now
                        </Button>
                      </div>
                      <div className="text-sm mt-1">7 minutes ago</div>
                    </div>

                    {/* Description */}
                    <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                      Your funds are held as USDC on the {usdcAccount.blockchain} network,
                      ensuring fast and cost-effective transactions while maintaining full
                      regulatory compliance.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Transaction Details Modal/Sidebar */}
      {selectedTransaction && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-lg">
          <TransactionDetails
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        </div>
      )}
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
