"use client"

import { Badge, BlurImage, Button, Separator } from "@freelii/ui"
import { CURRENCIES, DICEBEAR_SOLID_AVATAR_URL, pluralize, toUSD } from "@freelii/utils"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Building2, Check, ChevronRight, Download, Edit2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface Recipient {
    id: number
    name: string
    amount: number
    currency: string
    estimatedDelivery: string
    bankingDetails?: {
        bankName: string
        currency: {
            name: string
            flag: string
            symbol: string
        }
    }
}

interface PaymentDetails {
    senderBalance: number
    senderCurrency: string
    recipients: Recipient[]
    processingFee: number
    serviceCharge: number
    conversionRate: number
    paymentMode: 'per-recipient' | 'split'
    originAccount: {
        id: string
        name: string
        accountNumber: string
        currency: string
        balance: number
    }
}

interface PayoutReviewProps {
    onBack?: () => void
    onEdit?: () => void
    onConfirm?: () => void
}

export default function PayoutReview({ onBack, onEdit, onConfirm }: PayoutReviewProps) {
    const [paymentDetails] = useState<PaymentDetails>({
        senderBalance: 10000,
        senderCurrency: "USD",
        recipients: [
            {
                id: 1,
                name: "John Doe",
                amount: 97500,
                currency: "PHP",
                estimatedDelivery: "1-2 business days",
                bankingDetails: {
                    bankName: "BDO Unibank",
                    currency: {
                        name: "Philippine Peso",
                        flag: "https://flagcdn.com/w20/ph.png",
                        symbol: "₱"
                    }
                }
            },
            {
                id: 2,
                name: "Jane Smith",
                amount: 97500,
                currency: "PHP",
                estimatedDelivery: "2-3 business days",
                bankingDetails: {
                    bankName: "BPI",
                    currency: {
                        name: "Philippine Peso",
                        flag: "https://flagcdn.com/w20/ph.png",
                        symbol: "₱"
                    }
                }
            },
        ],
        processingFee: (97500 * 2) * 0.001,
        serviceCharge: 10,
        conversionRate: CURRENCIES.PHP?.rate ?? 1,
        paymentMode: 'split',
        originAccount: {
            id: "acc_123",
            name: "Main USD Account",
            accountNumber: "****1234",
            currency: "USD",
            balance: 50000
        }
    })

    const totalAmount = toUSD(paymentDetails.recipients.reduce((sum, recipient) => sum + recipient.amount, 0), "PHP")
    const totalFees = paymentDetails.processingFee + paymentDetails.serviceCharge;
    const finalTotal = totalAmount + totalFees

    const [isConfirmed, setIsConfirmed] = useState(false)

    const handleConfirm = () => {
        setIsConfirmed(true)
        onConfirm?.()
    }

    return (
        <div className="w-full relative space-y-6">
            <div className="grid grid-cols-[2fr,1fr] gap-6">
                {/* Left side - Payment Details */}
                <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-gray-200">
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-medium text-lg">Payment Details</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Review the payment details for {paymentDetails.recipients.length} {pluralize(paymentDetails.recipients.length, 'recipient')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Origin Account */}
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{paymentDetails.originAccount.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {paymentDetails.originAccount.accountNumber}
                                            </span>
                                        </div>

                                        <div className="flex items-start justify-between gap-3">
                                            <Badge className="bg-green-50 text-green-700 border-green-200">
                                                <span className="size-1.5 rounded-full bg-current" />
                                                <span className="text-[10px]">Active</span>
                                            </Badge>

                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1">
                                                    {CURRENCIES[paymentDetails.originAccount.currency] && (
                                                        <Image
                                                            src={CURRENCIES[paymentDetails.originAccount.currency]?.flag ?? ''}
                                                            alt={CURRENCIES[paymentDetails.originAccount.currency]?.name ?? ''}
                                                            width={12}
                                                            height={12}
                                                            className="rounded-full object-cover size-3"
                                                        />
                                                    )}
                                                    <span className="text-sm font-medium">
                                                        {CURRENCIES[paymentDetails.originAccount.currency]?.symbol ?? ''}
                                                        {paymentDetails.originAccount.balance.toLocaleString()}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-500">Available balance</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cost Breakdown */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {paymentDetails.paymentMode === 'per-recipient' ? 'Amount per recipient' : 'Total amount'}
                                        </span>
                                        <span className="font-medium flex items-center gap-1">
                                            {CURRENCIES[paymentDetails.originAccount.currency] && (
                                                <Image
                                                    src={CURRENCIES[paymentDetails.originAccount.currency]?.flag ?? ''}
                                                    alt={CURRENCIES[paymentDetails.originAccount.currency]?.name ?? ''}
                                                    width={12}
                                                    height={12}
                                                    className="rounded-full object-cover size-3"
                                                />
                                            )}
                                            {CURRENCIES[paymentDetails.originAccount.currency]?.symbol ?? ''}
                                            {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Processing fee</span>
                                            <span className="font-medium flex items-center gap-1">
                                                {CURRENCIES[paymentDetails.originAccount.currency] && (
                                                    <Image
                                                        src={CURRENCIES[paymentDetails.originAccount.currency]?.flag ?? ''}
                                                        alt={CURRENCIES[paymentDetails.originAccount.currency]?.name ?? ''}
                                                        width={12}
                                                        height={12}
                                                        className="rounded-full object-cover size-3"
                                                    />
                                                )}
                                                {CURRENCIES[paymentDetails.originAccount.currency]?.symbol ?? ''}
                                                {paymentDetails.processingFee.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Service charge</span>
                                            <span className="font-medium flex items-center gap-1">
                                                {CURRENCIES[paymentDetails.originAccount.currency] && (
                                                    <Image
                                                        src={CURRENCIES[paymentDetails.originAccount.currency]?.flag ?? ''}
                                                        alt={CURRENCIES[paymentDetails.originAccount.currency]?.name ?? ''}
                                                        width={12}
                                                        height={12}
                                                        className="rounded-full object-cover size-3"
                                                    />
                                                )}
                                                {CURRENCIES[paymentDetails.originAccount.currency]?.symbol ?? ''}
                                                {paymentDetails.serviceCharge.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Total cost</span>
                                        <span className="flex items-center gap-1">
                                            {CURRENCIES[paymentDetails.originAccount.currency] && (
                                                <Image
                                                    src={CURRENCIES[paymentDetails.originAccount.currency]?.flag ?? ''}
                                                    alt={CURRENCIES[paymentDetails.originAccount.currency]?.name ?? ''}
                                                    width={12}
                                                    height={12}
                                                    className="rounded-full object-cover size-3"
                                                />
                                            )}
                                            {CURRENCIES[paymentDetails.originAccount.currency]?.symbol ?? '$'}
                                            {finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={onBack} className="gap-2">
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={onEdit} className="gap-2">
                                <Edit2 className="size-4" />
                                Edit Payment
                            </Button>
                            <Button onClick={handleConfirm} className="gap-2">
                                Confirm Payment
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right side - Recipients Review */}
                <div
                    className="animate-in slide-in-from-right duration-300 p-6 rounded-lg border border-gray-200"
                >
                    <div className="space-y-6 ">
                        <div>
                            <h3 className="font-medium text-lg">Recipients</h3>
                            <div className="flex items-center gap-2 mt-3">
                                <div className="flex -space-x-2">
                                    {paymentDetails.recipients.map((recipient, index) => (
                                        <BlurImage
                                            key={recipient.id}
                                            src={`${DICEBEAR_SOLID_AVATAR_URL}${recipient.name}`}
                                            width={12}
                                            height={12}
                                            alt={recipient.name}
                                            className="size-6 shrink-0 overflow-hidden rounded-full border-2 border-white"
                                            style={{ zIndex: paymentDetails.recipients.length - index }}
                                        />
                                    ))}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {paymentDetails.recipients.map((recipient, index) => (
                                        <span key={recipient.id}>
                                            {index > 0 && index === paymentDetails.recipients.length - 1 && " and "}
                                            {index > 0 && index < paymentDetails.recipients.length - 1 && ", "}
                                            {recipient.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {paymentDetails.recipients.map((recipient) => (
                                <div key={recipient.id} className="rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <BlurImage
                                                src={`${DICEBEAR_SOLID_AVATAR_URL}${recipient.name}`}
                                                width={12}
                                                height={12}
                                                alt={recipient.name}
                                                className="size-8 shrink-0 overflow-hidden rounded-full"
                                            />
                                            <div>
                                                <p className="font-medium">{recipient.name}</p>
                                                {recipient.bankingDetails && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Building2 className="size-3 text-gray-500" />
                                                        <span className="text-xs text-gray-500">{recipient.bankingDetails.bankName}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1">
                                                {recipient.bankingDetails?.currency && (
                                                    <Image
                                                        src={recipient.bankingDetails.currency.flag ?? ''}
                                                        alt={recipient.bankingDetails.currency.name ?? ''}
                                                        width={12}
                                                        height={12}
                                                        className="rounded-full object-cover size-3"
                                                    />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {recipient.bankingDetails?.currency.symbol}
                                                    {recipient.amount.toLocaleString()}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-500">Will receive</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-col gap-1 text-xs text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center">
                                                {CURRENCIES.USD && (
                                                    <Image
                                                        src={CURRENCIES.USD?.flag ?? ''}
                                                        alt="USD"
                                                        width={12}
                                                        height={12}
                                                        className="rounded-full object-cover size-3 border border-white"
                                                    />
                                                )}
                                                {CURRENCIES[recipient.currency] && (
                                                    <Image
                                                        src={CURRENCIES[recipient.currency]?.flag ?? ''}
                                                        alt={recipient.currency}
                                                        width={12}
                                                        height={12}
                                                        className="rounded-full object-cover size-3 -ml-1 border border-white"
                                                    />
                                                )}
                                            </div>
                                            <span>
                                                {CURRENCIES.USD?.symbol}1 = {recipient.bankingDetails?.currency.symbol}
                                                {paymentDetails.conversionRate.toLocaleString()} • {" "}
                                                <span className="text-gray-400">
                                                    {CURRENCIES.USD?.symbol}{toUSD(recipient.amount, recipient.currency).toLocaleString()} → {recipient.bankingDetails?.currency.symbol}{recipient.amount.toLocaleString()}
                                                </span>
                                            </span>
                                        </div>
                                        <span>Estimated delivery: {recipient.estimatedDelivery}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isConfirmed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 space-y-6 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="size-16 rounded-full bg-green-100 mx-auto flex items-center justify-center"
                            >
                                <Check className="size-8 text-green-600" />
                            </motion.div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold">Payment Confirmed!</h2>
                                <p className="text-gray-500">
                                    Your payment of {CURRENCIES[paymentDetails.originAccount.currency]?.symbol}
                                    {finalTotal.toLocaleString()} has been processed. We've sent you a confirmation email.
                                </p>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => {
                                        // Add download logic here
                                    }}
                                >
                                    <Download className="size-4" />
                                    Download Confirmation
                                </Button>

                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        // Add navigation logic here
                                        window.location.href = '/dashboard'
                                    }}
                                >
                                    Return to Dashboard
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

