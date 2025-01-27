"use client"

import { useFixtures } from "@/fixtures/useFixtures"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { Badge, Button, Collapsible, CollapsibleContent, CollapsibleTrigger, ExpandingArrow, Separator } from "@freelii/ui"
import { CURRENCIES, noop } from "@freelii/utils"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { ArrowDownRight, ArrowUpRight, ChevronRight, Copy, RefreshCw, Wallet } from "lucide-react"
import Link from "next/link"

dayjs.extend(relativeTime)

export default function PageClient() {
  const { usdcAccount, getBalance, fiatAccounts, transactions } = useFixtures() // Update useFixtures to provide these

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Balance Card */}
        <div className="col-span-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="space-y-4">
              {/* Balance Section */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wallet className="size-4 text-gray-500" />
                  <span className="font-medium text-sm">Main Account</span>
                </div>
                <div className="text-2xl font-semibold">
                  {CURRENCIES['USDC']?.symbol}
                  {usdcAccount.balance.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Available balance</div>
              </div>

              <Separator />

              {/* Account Details */}
              <div className="space-y-3 ">
                <div>
                  <div className="text-sm text-gray-500">Account Type</div>
                  <div className="font-medium">Digital Currency Account</div>
                </div>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                    <ChevronRight className="size-4 transition-transform duration-200 ui-open:rotate-90" />
                    Network Details
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-2 pl-6">
                    {/* Blockchain & Network Info */}
                    <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-3 flex items-between">
                        <div className="text-left">
                          <div className="text-xs text-gray-500">Blockchain</div>
                          <div className="font-medium text-sm">{usdcAccount.blockchain}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Network</div>
                          <Badge className="mt-1 bg-blue-50 text-blue-700">
                            {usdcAccount.network}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Asset</div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-50 text-blue-700">USDC</Badge>
                          <span className="text-xs text-gray-500">
                            Circle USD Coin
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Address Information</div>
                      <div className="space-y-2">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Your Address</span>
                            <Button
                              variant="ghost"
                              className="h-6 px-2 text-xs gap-1"
                              onClick={() => navigator.clipboard.writeText(usdcAccount.address)}
                            >
                              <Copy className="size-3" />
                              Copy
                            </Button>
                          </div>
                          <code className="text-xs bg-white px-3 py-2 rounded block w-full overflow-x-auto">
                            {usdcAccount.address}
                          </code>
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
                            getBalance().finally(noop)
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
            </div>
          </div>
        </div>

        {/* Right Column - Off-ramp Options & Transactions */}
        <div className="col-span-8 space-y-6">
          {/* Off-ramp Options */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-4">Available Withdrawal Options</h3>
            <div className="space-y-3">
              {fiatAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FlagIcon currencyCode={account.currency} size={20} />
                        <div>
                          <div className="font-medium">{account.currency}</div>
                          <div className="text-sm text-gray-500">{account.bank_name}</div>
                        </div>
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div>
                        <div className="text-sm text-gray-600">Account Number</div>
                        <div className="font-medium">{account.account_number}</div>
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div>
                        <div className="text-sm text-gray-600">Account Name</div>
                        <div className="font-medium">{account.account_name}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="group px-6 pl-3 py-2 flex items-center gap-2"
                      onClick={() => {
                        // TODO: Implement off-ramp flow for this account
                        console.log(`Initiate off-ramp to ${account.id}`);
                      }}
                    >
                      Withdraw to {account.currency}
                      <ExpandingArrow className="size-4 -ml-2" />
                      <FlagIcon
                        currencyCode={account.currency}
                        className="ml-2 transition-transform duration-200 group-hover:scale-105 group-hover:brightness-110"
                      />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Recent Transactions</h3>
              <Link href="/dashboard/transactions">
                <Button variant="outline">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id}>
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
                        <div className="font-medium text-sm">{transaction.description}</div>
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
                        <Badge
                          className={`${transaction.status === 'completed'
                            ? 'bg-green-50 text-green-700'
                            : transaction.status === 'processing'
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-red-50 text-red-700'
                            } text-[10px]`}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <Button variant="ghost">
                        <Link href={`/dashboard/transactions/${transaction.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <Separator className="mt-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
