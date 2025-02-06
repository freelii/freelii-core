"use client"

import { useWalletStore } from "@/hooks/stores/wallet-store"
import { api } from "@/trpc/react"
import { ITransactionDetails } from "@/ui/transactions-table/transaction-details"
import TransactionsTable from "@/ui/transactions-table/transactions-table"
import { useWallet } from "@/wallet/useWallet"
import { Button, LoadingSpinner } from "@freelii/ui"
import { CURRENCIES } from "@freelii/utils"
import { USDC_SAC } from "@freelii/utils/constants"
import { fromStroops, toStroops } from "@freelii/utils/functions"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {
  ArrowUpRight,
  CreditCard
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

dayjs.extend(relativeTime)

const QuickActionButton = ({ icon, label, href }: { icon: JSX.Element, label: string, href: string }) => {
  return (
    <Link href={href} className="block p-4 border border-gray-200 rounded-lg bg-white hover:border-primary/20 transition-all">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  )
}

export default function PageClient() {
  const { account, transfer, isLoadingAccount } = useWallet();
  const { wallets, setSelectedWalletId } = useWalletStore();
  const [, setIsTransferring] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<ITransactionDetails | null>(null)
  const [, setIsQuickActionsOpen] = useState(false)

  // tRPC procedures
  const trpcUtils = api.useUtils();
  const { data: activity, isLoading: isLoadingActivity } = api.activity.getActivity.useQuery({ items: 7 });
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
    <div className="animate-in fade-in duration-500 mb-10" >
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Primary Account Overview */}
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold">{account?.alias}</h2>
                </div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-semibold mt-1">
                    {CURRENCIES.USDC?.symbol}
                    {fromStroops(account?.main_balance?.amount, 2)}
                  </p>
                  {isLoadingAccount && (
                    <LoadingSpinner className="h-4 w-4 ml-2 text-gray-400" />
                  )}
                </div>
              </div>
              {/* <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  disabled={isFunding}
                  onClick={() => fundWallet(account?.address)}
                  className="w-32"
                >
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  {isFunding ? 'Adding...' : 'Add Funds'}
                </Button>
              </div> */}
            </div>
          </div>

          {/* Account Stats Overview */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Monthly Activity</h3>
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-semibold">47</p>
              <p className="text-xs text-green-600 mt-1">+0% from last month</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Total Outgoing</h3>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-semibold">${fromStroops(0, 2)}</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Pending</h3>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-semibold">${fromStroops(5000000, 2)}</p>
              <p className="text-xs text-gray-500 mt-1">0 transactions</p>
            </div>
          </div> */}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              icon={<ArrowUpRight className="h-4 w-4" />}
              label="Send Money"
              href="/dashboard/payouts/new"
            />
            {/* <QuickActionButton
              icon={<ArrowDownLeft className="h-4 w-4" />}
              label="Add Funds"
              href="/dashboard/funding/new"
            /> */}
            <QuickActionButton
              icon={<CreditCard className="h-4 w-4" />}
              label="Cards"
              href="/dashboard/cards"
            />
            {/* <QuickActionButton
              icon={<PieChart className="h-4 w-4" />}
              label="Analytics"
              href="/dashboard/analytics"
            /> */}
          </div>

          {/* Recent Transactions */}
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <div className="flex items-center gap-2">
                {/* <Button variant="outline" className="text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Scheduled
                </Button> */}
                {/* <Link href="/dashboard/transactions">
                  <Button variant="ghost" className="text-sm">View All</Button>
                </Link> */}
              </div>
            </div>
            <TransactionsTable
              isLoading={isLoadingTx}
              transactions={txs?.slice(0, 5) ?? []}
              onRowClick={handleTransactionClick}
              selectedRowId={selectedTransaction?.id}
            />
          </div>
        </div>

        {/* Right Column - Network Details & Activity */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          {/* Activity Timeline */}
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-sm font-medium mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {activity?.map((activity, i) => {
                console.log(activity)
                if (activity.type === 'new_wallet') {
                  return (
                    <div key={i} className="flex items-start gap-3 group relative">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 relative before:absolute before:inset-0 before:rounded-full before:animate-pulse before:blur-sm
                        ${dayjs().diff(activity.raw.created_at, 'minute') < 5
                          ? 'bg-green-500/60 before:bg-green-500'
                          : 'bg-primary/60 before:bg-primary'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          <Button
                            variant="ghost"
                            className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors hover:border-gray-300 transition-opacity duration-200 mr-1"
                            onClick={() => setSelectedWalletId(activity.raw.id)}
                          >
                            {activity.raw.alias}
                          </Button>
                          account created</p>
                        <p className="text-xs text-gray-500">{dayjs(activity.raw.created_at).fromNow()}</p>
                      </div>
                      <div className="absolute right-0 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                        <p className="text-xs text-gray-400">{dayjs(activity.raw.created_at).format('MMM D, YYYY hh:mm')}</p>
                      </div>
                    </div>

                  )
                } else if (activity.type === 'transfer_out') {
                  return (
                    <div key={i} className="flex items-start gap-3 group relative">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 relative before:absolute before:inset-0 before:rounded-full before:animate-pulse before:blur-sm
                        ${dayjs().diff(activity.raw.created_at, 'minute') < 5
                          ? 'bg-green-500/60 before:bg-green-500'
                          : 'bg-primary/60 before:bg-primary'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="text-xs font-medium text-gray-600">
                            {CURRENCIES.USDC?.symbol}
                            {fromStroops(activity.raw.amount, 2)}
                          </span>
                          <span className="ml-1">payment sent </span>
                        </p>
                        <p className="text-xs text-gray-500">{dayjs(activity.raw.created_at).fromNow()}</p>
                      </div>
                      <div className="absolute right-0 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                        <p className="text-xs text-gray-400">{dayjs(activity.raw.created_at).format('MMM D, YYYY hh:mm')}</p>
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile slide-over and transaction details remain unchanged */}
    </div >
  )
}
