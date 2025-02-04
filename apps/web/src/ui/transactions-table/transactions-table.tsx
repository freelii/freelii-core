import { InstantBadge } from '@/ui/shared/badges/instant-badge'
import { StatusBadge } from '@/ui/shared/badges/status-badge'
import { FlagIcon } from '@/ui/shared/flag-icon'
import { cn, CURRENCIES } from '@freelii/utils'
import dayjs from 'dayjs'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { ITransactionDetails } from './transaction-details'


interface TransactionsTableProps {
    isLoading?: boolean
    transactions: ITransactionDetails[]
    onRowClick: (transaction: ITransactionDetails) => void
    selectedRowId?: string
}

export default function TransactionsTable({
    transactions,
    onRowClick,
    selectedRowId,
    isLoading = false
}: TransactionsTableProps) {


    return (
        <div className="animate-in fade-in duration-500 p-2">
            {transactions.slice(0, 5).map((transaction) => (
                <div
                    key={transaction.id}
                    data-transaction-row
                    onClick={() => onRowClick(transaction)}
                    className={cn(
                        "cursor-pointer hover:bg-gray-50 rounded-lg px-4 py-2 transition-colors",
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
                </div>
            ))}
        </div>
    )
}