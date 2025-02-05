"use client"

import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler"
import { api } from "@/trpc/react"
import { Recipient } from "@/ui/recipients-table/recipients-table"
import { InstantBadge } from "@/ui/shared/badges/instant-badge"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { useWallet } from "@/wallet/useWallet"
import { Badge, BlurImage, Button, LoadingDots, LoadingSpinner, Separator, useCopyToClipboard, useRouterStuff } from "@freelii/ui"
import { cn, CURRENCIES, DICEBEAR_SOLID_AVATAR_URL, TESTNET } from "@freelii/utils"
import { fromStroops, hasEnoughBalance, shortAddress, toStroops } from "@freelii/utils/functions"
import { Wallet } from "@prisma/client"
import { AnimatePresence, motion } from "framer-motion"
import { Building2, Check, Copy, Download, Edit2, XCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "react-hot-toast"

interface PaymentDetails {
    recipient: Recipient;
    originAccount: Wallet;
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

export default function PayoutReview({ onEdit, onConfirm }: PayoutReviewProps) {
    const { transfer, account } = useWallet();
    const { searchParams } = useRouterStuff();
    const [, copyToClipboard] = useCopyToClipboard();

    const recipientId = searchParams.get('recipientId');
    const selectedAccount = searchParams.get('recipientAccount');
    const transferToFreelii = searchParams.get('transferToFreelii') !== 'false' && true;

    // tRPC procedures
    const registerPayment = api.ledger.registerPayment.useMutation({
        onError: ClientTRPCErrorHandler
    });
    const { data: client, isLoading: isLoadingClient } = api.clients.get.useQuery({ id: Number(recipientId) }, {
        enabled: !!recipientId
    })

    const paymentDetails = useMemo<PaymentDetails>(() => ({
        recipient: client!,
        originAccount: account!,
        fees: {
            processingFee: 1.00,
            serviceCharge: 10.00
        },
        fx: {
            rate: 0.018,
            margin: 0.5
        }
    }), [client, account])

    const [isConfirmed, setIsConfirmed] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)


    const recipientAccount = useMemo(() => {
        if (client) {
            return client.blockchain_accounts?.find(acc => acc.id === selectedAccount)
        }
        return null;
    }, [client, selectedAccount])

    // Check if we have all required data
    const isLoading = isLoadingClient || !account
    const hasRequiredData = !!client && !!recipientAccount && !!account

    // Show loading state if data is being fetched
    if (isLoading) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <LoadingSpinner className="size-8" />
                    <p className="text-sm text-gray-500">Loading payment details...</p>
                </div>
            </div>
        )
    }

    // Show error state if required data is missing
    if (!hasRequiredData) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="size-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                        <XCircle className="size-6 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-medium">Invalid Payment Details</p>
                        <p className="text-sm text-gray-500">
                            {!client ? "Recipient not found. " : ""}
                            {!recipientAccount ? "Payment method not selected. " : ""}
                            {!account ? "Wallet not connected. " : ""}
                            Please try again.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={onEdit}
                        className="mt-4"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }


    const handleConfirm = async () => {
        try {
            if (!hasEnoughBalance(account?.main_balance?.amount ?? 0, Number(searchParams.get('amount')) ?? 0)) {
                toast.error("Insufficient balance")
                return;
            } else if (Number(searchParams.get('amount')) <= 0) {
                toast.error("Invalid amount for payment")
                return;
            }

            if (!recipientAccount?.address) {
                toast.error("Recipient account not found")
                return;
            }

            setIsProcessing(true)
            const at = await transfer({
                to: recipientAccount.address,
                amount: toStroops(Number(searchParams.get('amount'))),
                sacAddress: TESTNET.USDC_SAC
            })

            console.log('trasnfer res', at, at.txId, at.txHash)


            registerPayment.mutate({
                walletId: account.id,
                txId: at.txHash,
                txHash: at.txHash,
                senderId: account.user_id,
                recipientId: client.id,
                amount: toStroops(Number(searchParams.get('amount'))),
                currency: "USDC"
            });

            setIsProcessing(false)
            setIsConfirmed(true)
            onConfirm?.()
        } catch (error) {
            toast.error("Error processing payment")
            setIsProcessing(false)
            console.error(error)
        }
    }

    const totalFees = (paymentDetails.fees.processingFee + paymentDetails.fees.serviceCharge) * 0
    const fxRate = CURRENCIES.USDC?.rate ?? 1
    const recipientAmount = (Number(searchParams.get('amount')) ?? 0) * fxRate;
    const totalCost = Number(searchParams.get('amount')) + totalFees;

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
                                            <span className="text-xs text-gray-500">{recipientAccount?.network}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Will receive</span>
                                        <span className="font-medium">
                                            {CURRENCIES.USDC?.symbol}
                                            {(recipientAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Currency</span>
                                        <div className="flex items-center gap-2">
                                            <FlagIcon
                                                currencyCode="USDC"
                                                className="size-4"
                                            />
                                            <span>{CURRENCIES.USDC?.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Estimated delivery</span>
                                        {transferToFreelii ?
                                            <InstantBadge /> :
                                            <span>1-3 business days</span>}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <h4 className="text-sm font-medium">Recipient Account</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Network</span>
                                            <span>{recipientAccount?.network}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Address</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                {shortAddress(recipientAccount?.address)}
                                                <Button onClick={() => copyToClipboard(recipientAccount?.address, false)} variant="ghost" className="text-xs text-gray-500">
                                                    <Copy className="size-3" />
                                                </Button>
                                            </span>
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
                                        <span className="text-sm font-medium">{paymentDetails.originAccount?.alias}</span>
                                        <span className="text-xs text-gray-500">
                                            {shortAddress(paymentDetails.originAccount?.address)}
                                        </span>
                                    </div>

                                    <div className="flex items-start justify-between gap-3">

                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1">
                                                <FlagIcon
                                                    currencyCode={CURRENCIES.USDC?.shortName}
                                                    className="size-3"
                                                />
                                                <span className="text-sm font-medium">
                                                    {fromStroops(account.main_balance?.amount ?? 0, 2)}
                                                </span>
                                            </div>
                                            {hasEnoughBalance(account.main_balance?.amount ?? 0, Number(searchParams.get('amount')) ?? 0) ?
                                                <span className="text-[10px] text-gray-500">Available balance</span> :
                                                <span className="text-[10px] text-red-500">Insufficient balance</span>}
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
                                            {CURRENCIES.USDC?.symbol}
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
                                                        currencyCode={CURRENCIES.USDC?.shortName}
                                                        className="size-4 rounded-full border-2 border-white"
                                                    />
                                                    <FlagIcon
                                                        currencyCode={"USDC"}
                                                        className="size-4 -ml-2 rounded-full border-2 border-white"
                                                    />

                                                </div>
                                                <span>Exchange Rate</span>
                                            </div>
                                            <span className="flex items-center gap-2 font-medium">
                                                <Badge className="flex items-center gap-1.5 py-0.5 pl-1 pr-2">
                                                    <FlagIcon
                                                        currencyCode={"USDC"}
                                                        className="size-4"
                                                    />
                                                    {CURRENCIES.USDC?.symbol}
                                                    {CURRENCIES.USDC?.rate}
                                                </Badge>
                                            </span>
                                        </div>
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
                                            <FlagIcon
                                                currencyCode={account.main_balance?.currency}
                                                size={16}
                                            />
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
                                                {transferToFreelii && <InstantBadge />}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                To {shortAddress(recipientAccount?.address)}
                                                <Button onClick={() => copyToClipboard(recipientAccount?.address, false)} variant="ghost" className="text-xs text-gray-500">
                                                    <Copy className="size-3" />
                                                </Button>
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
                                Edit
                            </Button>
                            <Button disabled={isProcessing} onClick={handleConfirm}
                                className={cn(
                                    "gap-2",
                                    isProcessing && "opacity-50 py-3 px-6 w-full"
                                )}
                            >
                                {isProcessing ?
                                    <LoadingDots className="size-4" color="white" /> :
                                    "Confirm Payment"}
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

