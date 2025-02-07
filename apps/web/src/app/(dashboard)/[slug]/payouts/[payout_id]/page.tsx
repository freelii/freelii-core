"use client"

import { useFixtures } from "@/fixtures/useFixtures"
import { PageContent } from "@/ui/layout/page-content"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { Badge, BlurImage, MaxWidthWrapper, Separator } from "@freelii/ui"
import { CURRENCIES, DICEBEAR_SOLID_AVATAR_URL, fromFormattedToNumber, noop, pluralize, toUSD } from "@freelii/utils"
import { Building2, CheckCircle2, Download } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { type Payout } from "../../payouts/page-payouts"
import { PayoutNotFound } from "./payout-not-found"

export default function PayoutDetailsPage() {
    const params = useParams()
    const { getSinglePayout } = useFixtures()
    const [payoutDetails, setPayoutDetails] = useState<Payout | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPayout = async () => {
            try {
                const payout = await getSinglePayout(params.payout_id as string)
                setPayoutDetails(payout ?? null)
            } catch (error) {
                console.error('Error fetching payout:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPayout().then(noop).catch(noop)
    }, [params.payout_id, getSinglePayout])

    if (isLoading) {
        return <div>Loading...</div> // Replace with proper loading component
    }

    if (!payoutDetails) {
        return <PayoutNotFound />
    }

    const totalAmount = toUSD(fromFormattedToNumber(payoutDetails.amount), payoutDetails.currency)
    const processingFee = fromFormattedToNumber(payoutDetails.amount) * 0.001
    const serviceCharge = 10
    const totalFees = processingFee + serviceCharge
    const finalTotal = totalAmount + totalFees

    return (
        <PageContent title="Payout Details">
            <MaxWidthWrapper>
                <div className="w-full relative space-y-6 animate-in fade-in duration-300">
                    {/* Header with Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Badge className="bg-green-50 text-green-700">
                                <CheckCircle2 className="size-3" />
                                {payoutDetails.progress}
                            </Badge>
                            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                <Download className="size-4" />
                                Download Receipt
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-[2fr,1fr] gap-6">
                        {/* Left side - Payment Details */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-lg border border-gray-200">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-medium text-lg">Payment Details</h3>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Payment to {payoutDetails.recipients.length} {pluralize(payoutDetails.recipients.length, 'recipient')}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Cost Breakdown */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Total amount</span>
                                                <span className="font-medium flex items-center gap-1">
                                                    <FlagIcon currencyCode={payoutDetails.currency} size={12} />
                                                    {CURRENCIES[payoutDetails.currency]?.symbol}
                                                    {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Processing fee</span>
                                                    <span className="font-medium flex items-center gap-1">
                                                        <FlagIcon currencyCode={payoutDetails.currency} size={12} />
                                                        {CURRENCIES[payoutDetails.currency]?.symbol}
                                                        {processingFee.toFixed(2)}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Service charge</span>
                                                    <span className="font-medium flex items-center gap-1">
                                                        <FlagIcon currencyCode={payoutDetails.currency} size={12} />
                                                        {CURRENCIES[payoutDetails.currency]?.symbol}
                                                        {serviceCharge.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="flex justify-between text-sm font-medium">
                                                <span>Total cost</span>
                                                <span className="flex items-center gap-1">
                                                    <FlagIcon currencyCode={payoutDetails.currency} size={12} />
                                                    {CURRENCIES[payoutDetails.currency]?.symbol}
                                                    {finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="p-4 rounded-lg border border-gray-200">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Next Payment</span>
                                        <span>{new Date(payoutDetails.nextPayment).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Recipients */}
                        <div className="p-6 rounded-lg border border-gray-200">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium text-lg">Recipients</h3>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="flex -space-x-2">
                                            {payoutDetails.recipients.map((recipient, index) => (
                                                <BlurImage
                                                    key={recipient.id}
                                                    src={`${DICEBEAR_SOLID_AVATAR_URL}${recipient.name}`}
                                                    width={12}
                                                    height={12}
                                                    alt={recipient.name}
                                                    className="size-6 shrink-0 overflow-hidden rounded-full border-2 border-white"
                                                    style={{ zIndex: payoutDetails.recipients.length - index }}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {payoutDetails.recipients.map((recipient, index) => (
                                                <span key={recipient.id}>
                                                    {index > 0 && index === payoutDetails.recipients.length - 1 && " and "}
                                                    {index > 0 && index < payoutDetails.recipients.length - 1 && ", "}
                                                    {recipient.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {payoutDetails.recipients.map((recipient) => (
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
                                                                <span className="text-xs text-gray-500">{recipient.bankingDetails.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1">
                                                        <FlagIcon currencyCode={payoutDetails.currency} size={12} />
                                                        <span className="text-sm font-medium">
                                                            {CURRENCIES[payoutDetails.currency]?.symbol}
                                                            {(fromFormattedToNumber(payoutDetails.amount) / payoutDetails.recipients.length).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MaxWidthWrapper>
        </PageContent>
    )
} 