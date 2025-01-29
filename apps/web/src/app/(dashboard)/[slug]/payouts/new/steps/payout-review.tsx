"use client"

import { useFixtures } from "@/fixtures/useFixtures"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { Badge, BlurImage, Button, LoadingSpinner, Separator, useRouterStuff } from "@freelii/ui"
import { cn, CURRENCIES, DICEBEAR_SOLID_AVATAR_URL } from "@freelii/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Building2, Check, ChevronRight, Download, Edit2 } from "lucide-react"
import { useState } from "react"
import { Recipient } from "./recipients-table"

interface PaymentDetails {
    recipient: Recipient;
    originAccount: {
        id: string
        name: string
        accountNumber: string
        currency: {
            shortName: string
            name: string
            symbol: string
        }
        balance: number
    }
    fees: {
        processingFee: number
        serviceCharge: number
    }
    fx: {
        rate: number
        margin: number
    }
}

interface PayoutReviewProps {
    onBack?: () => void
    onEdit?: () => void
    onConfirm?: () => void
}

const DEMO_RECIPIENT_ID = 21;

export default function PayoutReview({ onBack, onEdit, onConfirm }: PayoutReviewProps) {
    const { recipients, usdcAccount, addDemoPayment } = useFixtures();
    const { searchParams } = useRouterStuff();

    const recipientId = searchParams.get('recipientId') ?? DEMO_RECIPIENT_ID;
    const transferToFreelii = searchParams.get('transferToFreelii') === 'true';
    const recipient = transferToFreelii ? {
        id: 24,
        isVerified: true,
        name: recipients.get(Number(recipientId))?.name ?? "Freelii USDC Account",
        email: recipients.get(Number(recipientId))?.email ?? "payments@freelii.com",
        recipientType: recipients.get(Number(recipientId))?.recipientType ?? "business",
        bankingDetails: {
            id: "bd_24",
            name: "Freelii USDC Account",
            accountNumber: "1234567890",
            routingNumber: "1234567890",
            bankName: "Freelii Digital Currency Account",
            bankAddress: "1234567890",
            bankCity: "San Francisco",
            bankState: "CA",
            bankZip: "94101",
            currency: {
                shortName: "USDC",
                name: "USDC",
                symbol: "USDC",
            }
        }
    } as Recipient : recipients.get(Number(recipientId)) as Recipient;

    const [paymentDetails] = useState<PaymentDetails>({
        recipient,
        originAccount: usdcAccount,
        fees: {
            processingFee: 1.00,
            serviceCharge: 10.00
        },
        fx: {
            rate: 0.018,
            margin: 0.5
        }
    })

    const [isConfirmed, setIsConfirmed] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleConfirm = async () => {
        setIsProcessing(true)
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsProcessing(false)
        setIsConfirmed(true)
        onConfirm?.()
        addDemoPayment(Number(searchParams.get('amount')), paymentDetails.recipient.bankingDetails!.currency.shortName, Number(recipientId))
    }

    const recipientAmount = Number(searchParams.get('amount')) ?? 0;
    const totalFees = (paymentDetails.fees.processingFee + paymentDetails.fees.serviceCharge) * 0
    const fxRate = CURRENCIES[paymentDetails.recipient.bankingDetails!.currency.shortName]?.rate ?? 1
    const totalCost = recipientAmount / fxRate + totalFees

    return (
        <div className="w-full relative space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-6">
                {/* Left side - Recipient Details */}
                <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-gray-200">
                        <div className="space-y-6">
                            {/* Recipient Card */}
                            <div className="">
                                <div className="flex items-start gap-3">
                                    <BlurImage
                                        src={`${DICEBEAR_SOLID_AVATAR_URL}${paymentDetails.recipient.name}`}
                                        width={48}
                                        height={48}
                                        alt={paymentDetails.recipient.name}
                                        className="size-12 shrink-0 overflow-hidden rounded-full"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{paymentDetails.recipient.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Building2 className="size-3 text-gray-500" />
                                            <span className="text-xs text-gray-500">{paymentDetails.recipient.bankingDetails!.bankName}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Will receive</span>
                                        <span className="font-medium">
                                            {paymentDetails.recipient.bankingDetails!.currency.symbol}
                                            {recipientAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Currency</span>
                                        <div className="flex items-center gap-2">
                                            <FlagIcon
                                                currencyCode={paymentDetails.recipient.bankingDetails!.currency.shortName}
                                                className="size-4"
                                            />
                                            <span>{paymentDetails.recipient.bankingDetails!.currency.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Estimated delivery</span>
                                        <span>1-2 business days</span>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <h4 className="text-sm font-medium">Bank Account Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Account holder</span>
                                            <span>{paymentDetails.recipient.bankingDetails!.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Account number</span>
                                            <span>{paymentDetails.recipient.bankingDetails!.accountNumber}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Origin Account */}
                            <div className="">
                                <h4 className="text-sm font-medium mb-3">Paying From</h4>
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
                                                <FlagIcon
                                                    currencyCode={paymentDetails.originAccount.currency.shortName}
                                                    className="size-3"
                                                />
                                                <span className="text-sm font-medium">
                                                    {paymentDetails.originAccount.balance.toLocaleString()}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-500">Available balance</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right - Payment Details */}
                <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-medium text-lg">Payment Details</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Review the payment breakdown before confirming
                                </p>
                            </div>

                            <div className="mt-6 space-y-6">
                                {/* Amount and FX Details */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Recipient will receive</span>
                                        <span className="font-medium flex items-center gap-1">
                                            {paymentDetails.recipient.bankingDetails!.currency.symbol}
                                            {recipientAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <Separator />

                                    {/* FX Details */}
                                    <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    <FlagIcon
                                                        currencyCode={paymentDetails.originAccount.currency.shortName}
                                                        className="size-4 rounded-full border-2 border-white"
                                                    />
                                                    <FlagIcon
                                                        currencyCode={paymentDetails.recipient.bankingDetails!.currency.shortName}
                                                        className="size-4 -ml-2 rounded-full border-2 border-white"
                                                    />

                                                </div>
                                                <span>Exchange Rate</span>
                                            </div>
                                            <span className="flex items-center gap-2 font-medium">
                                                <Badge className="flex items-center gap-1.5 py-0.5 pl-1 pr-2">
                                                    <FlagIcon
                                                        currencyCode={paymentDetails.recipient.bankingDetails!.currency.shortName}
                                                        className="size-4"
                                                    />
                                                    {CURRENCIES[paymentDetails.recipient.bankingDetails!.currency.shortName]?.symbol}
                                                    {CURRENCIES[paymentDetails.recipient.bankingDetails!.currency.shortName]?.rate}
                                                </Badge>
                                            </span>
                                        </div>
                                        {/* <div className="text-xs text-gray-500 flex justify-between">
                                            <span>Mid-market rate</span>
                                            <span>{(paymentDetails.fx.rate * (1 - paymentDetails.fx.margin / 100)).toFixed(2)} {paymentDetails.recipient.bankingDetails.currency.symbol}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex justify-between">
                                            <span>FX Margin ({paymentDetails.fx.margin}%)</span>
                                            <span>+ {(paymentDetails.fx.rate * (paymentDetails.fx.margin / 100)).toFixed(2)} {paymentDetails.recipient.bankingDetails.currency.symbol}</span>
                                        </div> */}
                                    </div>

                                    {/* Fees */}
                                    {/* <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Processing fee (0.1%)</span>
                                            <span className="font-medium">
                                                ${paymentDetails.fees.processingFee.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Service charge</span>
                                            <span className="font-medium">
                                                ${paymentDetails.fees.serviceCharge.toFixed(2)}
                                            </span>
                                        </div>
                                    </div> */}

                                    <Separator />

                                    {/* Total */}
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Total cost</span>
                                        <span className="flex items-center gap-1">
                                            ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Right */}
                        <div className="space-y-6">
                            <div className="pl-3">
                                <div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Estimated delivery progress
                                    </p>
                                </div>

                                <div className="mt-6">
                                    {/* Timeline steps */}
                                    <div className="relative pl-8 border-l-2 border-[#4ab3e8] pb-6">
                                        <div className="absolute left-0 -translate-x-[9px] size-4 rounded-full bg-[#4ab3e8]" />
                                        <div>
                                            <p className="font-medium text-sm">Payment Initiated</p>
                                            <p className="text-xs text-gray-500">Today</p>
                                        </div>
                                    </div>

                                    {!transferToFreelii && <div className="relative pl-8 border-l-2 border-gray-200 pb-6">
                                        {isProcessing ?
                                            <LoadingSpinner className="size-4 absolute left-0 -translate-x-[5px] p-2 bg-white pt-2 pb-0" /> :
                                            <div className={cn(
                                                "border-gray-200 bg-white absolute left-0 -translate-x-[9px] size-4 rounded-full border-2 transition-all duration-300",
                                            )} />}
                                        <div>
                                            <p className="font-medium text-sm">Processing</p>
                                            <p className="text-xs text-gray-500">Within 24 hours</p>
                                        </div>
                                    </div>}

                                    <div className="relative pl-8 border-l-2 border-transparent">
                                        <div className="absolute left-0 -translate-x-[9px] size-4 rounded-full border-2 border-gray-200 bg-white" />
                                        <div>
                                            <p className="font-medium text-sm flex items-center gap-1 justify-between">Expected Delivery
                                                {transferToFreelii && <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                    Instant
                                                </Badge>}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                To {paymentDetails.recipient.bankingDetails!.bankName}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional info */}
                                {/* <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">
                                        Note: Delivery times are estimates and may vary based on the receiving bank's processing times and local banking hours.
                                    </p>
                                </div> */}
                            </div>
                        </div>

                    </div>


                    {/* Action Buttons */}
                    <div className="flex items-center justify-end">

                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={onEdit} className="gap-2 text-xs">
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
                                    Your payment of ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been processed.
                                    We&apos;ve sent you a confirmation email.
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

