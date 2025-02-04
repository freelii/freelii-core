import { InstantBadge } from '@/ui/shared/badges/instant-badge'
import { StatusBadge } from '@/ui/shared/badges/status-badge'
import { FlagIcon } from '@/ui/shared/flag-icon'
import { Separator } from '@freelii/ui'
import { cn, CURRENCIES } from '@freelii/utils'
import dayjs from 'dayjs'
import { useEffect, useRef } from "react"


export interface ITransactionDetails {
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

export default function TransactionDetails({
    transaction,
    onClose
}: {
    transaction: ITransactionDetails
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