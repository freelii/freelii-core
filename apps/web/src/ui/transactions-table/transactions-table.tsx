import { cn, fromStroops } from '@freelii/utils'
import { type Client, type Transactions, type User } from '@prisma/client'
import dayjs from 'dayjs'
import { ArrowDownRight, ArrowUpRight, InboxIcon } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '../shared/badges/status-badge'
import { type ITransactionDetails } from './transaction-details'
import { formatTransaction } from './transaction-formatter'

interface TransactionsTableProps {
    isLoading?: boolean
    transactions: (Transactions & { recipient?: Client | null, sender?: User | null })[]
    onRowClick: (transaction: ITransactionDetails) => void
    selectedRowId?: string
}

export default function TransactionsTable({
    transactions,
    onRowClick,
    selectedRowId,
    isLoading = false
}: TransactionsTableProps) {
    if (!transactions.length) {
        return (
            <div className="animate-in fade-in duration-500 p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-gray-50 p-3 rounded-full">
                    <InboxIcon className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-900">No transactions yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Your transactions will appear here once you start sending or receiving payments.
                </p>
            </div>
        )
    }

    return (
        <div className="animate-in fade-in duration-500 p-2">
            {transactions.map(formatTransaction).slice(0, 5).map((transaction) => (
                <div
                    key={transaction.id}
                    data-transaction-row
                    onClick={() => onRowClick(transaction)}
                    className={cn(
                        "cursor-pointer hover:bg-gray-50 rounded-lg px-4 py-2 transition-colors group",
                        selectedRowId === transaction.id && "bg-gray-50"
                    )}
                >
                    <div className="flex items-center justify-between">
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
                                    <StatusBadge text={transaction.status} />


                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    {dayjs(transaction.date).format('MMM D, YYYY [at] h:mm A')}
                                    <span className="text-gray-300">•</span>
                                    <span>{transaction.reference ?? ''}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className=" font-medium flex items-center gap-1 justify-end">
                                    <Link href={`/dashboard/invoices/${transaction.invoice_id ?? 'create?tx_id=' + transaction.id}`}>
                                        <span className={cn(
                                            "inline-flex items-center mr-2 rounded-md px-1.5 py-0.5 text-xs font-medium border cursor-pointer transition-colors",
                                            transaction.invoice_id
                                                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                                        )}>
                                            {transaction.invoice_id
                                                ? (transaction.type === 'sent' ? "View Receipt" : "View Invoice")
                                                : (transaction.type === 'sent' ? "Receipt" : "Invoice")
                                            }
                                        </span>
                                    </Link>
                                    {fromStroops(transaction.amount, 2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}