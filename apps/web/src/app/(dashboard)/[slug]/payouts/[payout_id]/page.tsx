"use client"

import { useWalletStore } from "@/hooks/stores/wallet-store"
import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { InstantBadge } from "@/ui/shared/badges/instant-badge"
import { StatusBadge } from "@/ui/shared/badges/status-badge"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { useWallet } from "@/wallet/useWallet"
import { Badge, BlurImage, Button, LoadingDots, LoadingSpinner, MaxWidthWrapper, Separator, useRouterStuff, Webhook } from "@freelii/ui"
import { cn, CURRENCIES, DICEBEAR_SOLID_AVATAR_URL } from "@freelii/utils"
import { fromStroops, hasEnoughBalance, toStroops } from "@freelii/utils/functions"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { motion } from "framer-motion"
import { Edit2, XCircle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { AccountDetails } from "../new/steps/account-details"
import { PayoutNotFound } from "./payout-not-found"

dayjs.extend(relativeTime)

export default function PayoutDetailsPage() {
    const { account, transfer } = useWallet();
    const { setSelectedWalletId, selectedWalletId } = useWalletStore();
    const params = useParams();
    const router = useRouter();
    const { searchParams } = useRouterStuff();
    const paymentId = params?.payout_id as string;
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [transferStep, setTransferStep] = useState<'idle' | 'initiating' | 'processing' | 'confirming'>('idle');


    // tRPC procedures
    const { mutateAsync: processPaymentSettled, isPending: isProcessingPaymentSettled } = api.orchestrator.processPaymentSettled.useMutation();
    const { data: payment, isLoading: isLoadingPayment } = api.orchestrator.getPaymentState.useQuery({ paymentId: paymentId }, {
        enabled: !!paymentId
    })
    const { data: paymentInstructions, isLoading: isLoadingPaymentInstructions } = api.orchestrator.getPaymentInstructions.useQuery({ paymentId: paymentId }, {
        enabled: !!paymentId
    })
    const { mutateAsync: confirmBlockchainConfirmation } = api.orchestrator.confirmBlockchainConfirmation.useMutation({})

    useEffect(() => {
        console.log('payment', payment?.wallet_id)
        console.log('account', account?.id)
        console.log('selectedWalletId', selectedWalletId)
        if (payment && selectedWalletId !== payment?.wallet_id) {
            console.log('setting selectedWalletId', payment.wallet_id)
            setSelectedWalletId(payment.wallet_id);
        }
    }, [account, selectedWalletId, payment]);

    // Show loading state if data is being fetched
    if (isLoadingPayment) {
        return (
            <div className="w-full relative space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-6">
                    {/* Left side skeleton */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-lg border border-gray-200 animate-pulse">
                            <div className="space-y-6">
                                {/* Recipient skeleton */}
                                <div className="flex items-start gap-3">
                                    <div className="size-12 rounded-full bg-gray-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                                    </div>
                                </div>

                                {/* Account details skeleton */}
                                <div className="space-y-3 pt-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    <div className="h-10 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side skeleton */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-lg border border-gray-200 animate-pulse">
                            <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
                                <div className="space-y-6">
                                    {/* Payment details header skeleton */}
                                    <div className="space-y-2">
                                        <div className="h-5 bg-gray-200 rounded w-1/3" />
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    </div>

                                    {/* Payment breakdown skeleton */}
                                    <div className="space-y-4 pt-4">
                                        {[1, 2, 3, 4].map((_, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                                <div className="h-4 bg-gray-200 rounded w-1/4" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Timeline skeleton */}
                                <div className="space-y-4 pl-3">
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    <div className="space-y-6 pt-4">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="pl-8 border-l-2 border-gray-200">
                                                <div className="space-y-2">
                                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                                    <div className="h-2 bg-gray-200 rounded w-1/3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const hasRequiredData = account && payment && payment?.recipient && payment.destination;

    if (!payment) {
        return <PayoutNotFound />
    }

    if (isLoadingPayment) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center">
                <LoadingSpinner />
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
                            {!payment.recipient ? "Recipient not found. " : ""}
                            {!payment.destination ? "Payment method not selected. " : ""}
                            {!account ? "Wallet not connected. " : ""}
                            Please try again.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (payment?.wallet_id !== selectedWalletId) {
        return (<div className="w-full h-[600px] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="size-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                    <XCircle className="size-6 text-red-500" />
                </div>
                <div className="space-y-2">
                    <p className="font-medium">Invalid Wallet</p>
                    <span className="text-sm text-gray-500">
                        {`Please select the correct wallet to view this payout.`}
                        <br />
                        Selected wallet: {payment?.wallet_id}
                    </span>
                    <span className="text-sm text-gray-500">
                        Current wallet: {selectedWalletId}
                    </span>
                    <p className="text-sm text-gray-500">
                        Please try again.
                    </p>
                </div>
            </div>
        </div>)
    }

    const handleTransfer = async () => {
        try {
            if (!payment) {
                toast.error("Payment not found")
                return;
            }

            if (!hasEnoughBalance(account?.main_balance?.amount ?? 0, Number(payment.source_amount))) {
                toast.error("Insufficient balance")
                return;
            } else if (Number(payment.source_amount) <= 0) {
                toast.error("Invalid amount for payment")
                return;
            }

            setIsProcessing(true)
            setTransferStep('initiating')

            const liquidationAddress = paymentInstructions?.walletAddress;
            if (!liquidationAddress) {
                toast.error("Liquidation address not found")
                return;
            }


            setTransferStep('processing')

            // Start a timer to update the UI after 1 second
            setTimeout(() => {
                setTransferStep('confirming')
            }, 2500)

            // Perform the transfer
            const at = await transfer({
                to: liquidationAddress,
                amount: toStroops(Number(payment.source_amount) / 100),
            })

            if (at?.txHash) {
                await confirmBlockchainConfirmation({
                    paymentId: payment.id,
                    txId: at?.txHash,
                    txHash: at?.txHash,
                });
            }

            setIsProcessing(false)
            setTransferStep('idle')
            // Redirect to success page
            const slug = String(params && Array.isArray(params.slug) ? params.slug[0] : params?.slug || '');
            const id = String(Array.isArray(paymentId) ? paymentId[0] : (paymentId || ''));
            router.push(`/${slug}/payouts/${id}/success`)
        } catch (error) {
            console.error(error)
            toast.error("Error processing payment")
            setIsProcessing(false)
            setTransferStep('idle')
        }
    }

    const currencyCode = payment?.source_currency;
    const totalCost = payment?.source_amount / 100;
    const recipientAmount = payment?.target_amount / 100;
    const isEwallet = !!payment?.destination?.ewallet_account;
    const isInstant = !!payment?.destination?.blockchain_account;

    const onEdit = () => {
        router.back();
    }

    const handleConfirm = () => {
        console.log('handleConfirm')
    }

    const loadingStates = {
        initiating: {
            title: "Initiating Transfer",
            description: "Please wait while we prepare your transfer..."
        },
        processing: {
            title: "Processing Payment",
            description: "Your payment is being processed ..."
        },
        confirming: {
            title: "Confirming Transaction",
            description: "Almost done! Confirming your transaction..."
        }
    }

    return (
        <PageContent>
            <MaxWidthWrapper className="space-y-6 p-10">
                <div className="w-full relative space-y-6">
                    {/* Title Section */}
                    <div className="border-b border-gray-200 pb-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-semibold text-gray-900">Review Payment</h1>
                                <div className="flex items-center gap-2">
                                    <StatusBadge text={payment?.status} />
                                    <span className="text-sm text-gray-500">
                                        Created {dayjs(payment?.created_at).fromNow()}
                                    </span>
                                </div>
                            </div>
                            {searchParams?.get("debug") === "true" && <div>
                                <Button disabled={isProcessingPaymentSettled} onClick={() => processPaymentSettled({ paymentId })}
                                    className={cn(
                                        "gap-2 h-6 bg-blue-500 text-white",
                                        isProcessing && "opacity-50 py-3 px-6 w-full"
                                    )}
                                >
                                    <Webhook className="size-4" />
                                    {isProcessingPaymentSettled ?
                                        <LoadingDots className="size-4" color="black" /> :
                                        "payment received"
                                    }
                                </Button>   <Button disabled={isProcessingPaymentSettled} onClick={() => processPaymentSettled({ paymentId })}
                                    className={cn(
                                        "gap-2 h-6 bg-blue-500 text-white",
                                        isProcessing && "opacity-50 py-3 px-6 w-full"
                                    )}
                                >
                                    <Webhook className="size-4" />
                                    {isProcessingPaymentSettled ?
                                        <LoadingDots className="size-4" color="black" /> :
                                        "cashout completed"
                                    }
                                </Button>
                            </div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-6">
                        {/* Left side - Recipient Details */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-lg border border-gray-200">
                                <div className="space-y-6">
                                    {/* Recipient Card */}
                                    <div className="">
                                        <div className="flex items-start gap-3">
                                            <BlurImage
                                                src={`${DICEBEAR_SOLID_AVATAR_URL}${payment?.recipient?.name || ''}`}
                                                width={48}
                                                height={48}
                                                alt={payment?.recipient?.name || ''}
                                                className="size-12 shrink-0 overflow-hidden rounded-full"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">{payment?.recipient.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500">{payment?.recipient?.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <AccountDetails selectedAccount={payment?.destination} />
                                    </div>

                                    <Separator />

                                    {/* Origin Account */}
                                    <div className="">
                                        <h4 className="text-sm font-medium mb-3">Paying From</h4>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{account.alias}</span>
                                                {/* <span className="text-xs text-gray-500">
                                        {shortAddress(paymentDetails.originAccount?.address)}
                                    </span> */}
                                            </div>

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1">
                                                        {/* <FlagIcon
                                                currencyCode={CURRENCIES.USDC?.shortName}
                                                className="size-3"
                                            /> */}
                                                        <span className="text-sm font-medium">
                                                            {fromStroops(account.main_balance?.amount ?? 0, 2)}
                                                        </span>
                                                    </div>
                                                    {hasEnoughBalance(account?.main_balance?.amount ?? 0, toStroops(payment?.source_amount / 100)) ?
                                                        <span className="text-[10px] text-gray-500">Available balance</span> :
                                                        <span className="text-[10px] text-red-500">Insufficient balance</span>
                                                    }
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
                                        <Separator />
                                        {/* Amount and FX Details */}
                                        <div className="space-y-3">


                                            {/* FX Details */}
                                            {currencyCode !== "USD" && <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            <FlagIcon
                                                                currencyCode={payment.source_currency}
                                                                className="size-4 rounded-full border-2 border-white"
                                                            />
                                                            <FlagIcon
                                                                currencyCode={payment.target_currency}
                                                                className="size-4 -ml-2 rounded-full border-2 border-white"
                                                            />

                                                        </div>
                                                        <span>Exchange Rate</span>
                                                    </div>
                                                    <span className="flex items-center gap-2 font-medium">
                                                        <Badge className="flex items-center gap-1.5 py-0.5 pl-1 pr-2">
                                                            <FlagIcon
                                                                currencyCode={payment.target_currency}
                                                                className="size-4"
                                                            />
                                                            {CURRENCIES[payment.target_currency ?? "USD"]?.symbol}
                                                            {(Number(payment?.exchange_rate) / 100.00).toFixed(2)}
                                                        </Badge>
                                                    </span>
                                                </div>
                                            </div>}

                                            {/* Fees */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Processing fee (free)</span>
                                                    <span className="font-medium">
                                                        $0.00
                                                    </span>
                                                </div>

                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Service charge</span>
                                                    <span className="font-medium">
                                                        $0.00
                                                    </span>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Total */}
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>Total cost</span>
                                                <span className="flex items-center gap-1">
                                                    {/* <FlagIcon
                                            currencyCode={account.main_balance?.currency}
                                            size={16}
                                        /> */}
                                                    {totalCost.toLocaleString('en-US', { style: 'currency', currency: payment.source_currency === "USDC" ? "USD" : payment.source_currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className="flex font-medium justify-between text-sm">
                                                <span>Recipient will receive</span>
                                                <span className=" flex items-center gap-1">
                                                    {isInstant && <FlagIcon
                                                        currencyCode={payment.target_currency}
                                                        size={16}
                                                    />}
                                                    {!isInstant && payment.target_currency !== "USD" && <FlagIcon
                                                        currencyCode={payment.target_currency}
                                                        size={16}
                                                    />}
                                                    {recipientAmount.toLocaleString('en-US', { style: 'currency', currency: payment.target_currency === "USDC" ? "USD" : payment.target_currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                {/* Right */}
                                <div className="space-y-6">
                                    <div className="pl-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Payment Timeline
                                            </p>
                                        </div>

                                        <div className="mt-4">
                                            {/* Timeline steps */}
                                            <div className="relative pl-8 border-l-2 border-blue-500 pb-6">
                                                <div className="absolute left-0 -translate-x-[11px] size-5 rounded-full bg-blue-500 ring-4 ring-white" />
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">Payment Initiated</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">Today at {dayjs().format('h:mm A')}</p>
                                                </div>
                                            </div>


                                            {!isInstant && (
                                                <div className={cn("relative pl-8 border-l-2 border-gray-200 pb-6", !!payment.sent_to_recipient_at ? "border-blue-500" : "border-gray-200")}>
                                                    {isProcessing ? (
                                                        <>
                                                            <div className="absolute left-0 -translate-x-[11px] size-5 rounded-full bg-blue-100 ring-4 ring-white flex items-center justify-center">
                                                                <LoadingSpinner className="size-3 text-blue-500" />
                                                            </div>
                                                            <div className="animate-pulse">
                                                                <p className="font-medium text-sm text-gray-900">Processing Payment</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">Validating transaction...</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className={cn("absolute left-0 -translate-x-[11px] size-5 rounded-full bg-gray-100 ring-4 ring-white", (!!payment.sent_to_recipient_at || !!payment.sent_at) ? "bg-blue-500" : "bg-gray-100")} />
                                                            <div>
                                                                <p className="font-medium text-sm text-gray-900">{!!payment.sent_at ? "Processed" : "Processing"}</p>
                                                                {payment.sent_at ? <p className="text-xs text-gray-500 mt-0.5">{dayjs(payment.sent_at).fromNow()}</p> :
                                                                    <p className="text-xs text-gray-500 mt-0.5">Waiting for confirmation</p>
                                                                }
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {payment.sent_to_recipient_at && <div className="relative pl-8 border-l-2 border-gray-200 pb-6">
                                                <div className={cn("absolute left-0 -translate-x-[11px] size-5 rounded-full bg-gray-100 ring-4 ring-white", !!payment.sent_to_recipient_at ? "bg-blue-500" : "bg-gray-100")} />
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">Sent to recipient</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{dayjs(payment.sent_to_recipient_at).fromNow()}</p>
                                                </div>
                                            </div>}


                                            <div className="relative pl-8 border-l-2 border-transparent">
                                                <div className="absolute left-0 -translate-x-[11px] size-5 rounded-full bg-gray-100 ring-4 ring-white" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-sm text-gray-900">
                                                            Expected Delivery
                                                        </p>
                                                        {isInstant && <InstantBadge />}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {isInstant ? (
                                                            "Instant delivery"
                                                        ) : (
                                                            isEwallet ? "Instant" : `Within 24 hours`
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-600">
                                                All times are shown in your local timezone
                                            </p>
                                        </div>
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
                                    <Button disabled={isProcessing} onClick={handleTransfer}
                                        className={cn(
                                            "gap-2 h-8 relative overflow-hidden",
                                            isProcessing && "opacity-90"
                                        )}
                                    >
                                        {isProcessing && transferStep !== 'idle' && (
                                            <motion.div
                                                className="absolute inset-0 bg-blue-600/20"
                                                initial={{ x: '-100%' }}
                                                animate={{ x: '100%' }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            {isProcessing && transferStep !== 'idle' ? (
                                                <>
                                                    <LoadingDots className="size-4" color="white" />
                                                    {loadingStates[transferStep]?.title || "Processing..."}
                                                </>
                                            ) : (
                                                "Confirm Payment"
                                            )}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </MaxWidthWrapper>
        </PageContent>
    )
} 