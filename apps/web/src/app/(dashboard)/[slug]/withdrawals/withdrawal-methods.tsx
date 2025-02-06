"use client"

import { FiatAccount, useFixtures, Withdrawal } from "@/fixtures/useFixtures"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { Badge, Button, ExpandingArrow, Tabs, TabsContent, TabsList, TabsTrigger } from "@freelii/ui"
import { CURRENCIES } from "@freelii/utils/constants"
import { cn, maskFirstDigits } from "@freelii/utils/functions"
import dayjs from "dayjs"
import Link from "next/link"

export function WithdrawalsList({ withdrawals, fiatAccountsHash }: { withdrawals: Withdrawal[], fiatAccountsHash: Map<string, FiatAccount> }) {
    return (<div>
        {withdrawals.map((transaction) => (
            <div
                key={transaction.id}
                className={cn(
                    "cursor-pointer hover:bg-gray-50 p-2  rounded-lg transition-colors",
                )}
            >
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                        <div>
                            <div className="font-medium text-sm flex items-center gap-2">
                                {fiatAccountsHash.get(transaction.destination)?.bank_name}
                                <span className="text-gray-500">{maskFirstDigits(fiatAccountsHash.get(transaction.destination)?.account_number ?? '')}</span>
                                {transaction.currency === 'USDC' && (
                                    <Badge
                                        className="bg-green-50 text-green-700 border-green-200 gap-1 flex items-center py-0 h-4"
                                    >
                                        <span className="text-[10px]">instant</span>
                                    </Badge>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                {dayjs(transaction.date).format('MMM D, YYYY [at] h:mm A')}
                                <span className="text-gray-300">•</span>
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
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : transaction.status === 'processing'
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                    } text-[10px]`}
                            >
                                {transaction.status}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>)
}

export function WithdrawalMethods() {
    const { fiatAccounts, withdrawals } = useFixtures()

    const fiatAccountsHash = new Map(fiatAccounts.map(account => [account.id, account]))

    return (
        <div className="grid grid-cols-12 gap-6">

            <div className="col-span-7">
                <div className="p-4 border border-gray-200 rounded-lg">
                    <Tabs defaultValue="latest" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="latest">Latest Withdrawals</TabsTrigger>
                            <TabsTrigger value="request">Pending Withdrawals</TabsTrigger>
                        </TabsList>

                        <TabsContent value="latest">
                            <WithdrawalsList withdrawals={withdrawals.filter(withdrawal => withdrawal.status === 'completed')} fiatAccountsHash={fiatAccountsHash} />
                        </TabsContent>

                        <TabsContent value="request">
                            <WithdrawalsList withdrawals={withdrawals.filter(withdrawal => withdrawal.status === 'processing')} fiatAccountsHash={fiatAccountsHash} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <div className="col-span-5 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">

                    <h3 className="font-medium mb-4">
                        Available Withdrawal Options
                    </h3>
                    <Button variant="outline" className="border-none" >
                        Link account
                    </Button>
                </div>


                <div className="space-y-3 mt-2">
                    {fiatAccounts.map((account) => (
                        <div key={account.id} className="border-b border-gray-200 p-3 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
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
    )
} 