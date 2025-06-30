"use client"

import { PaymentConfirmationPreview } from "@/components/payment-confirmation-preview"
import { generateInvoicePDF } from "@/lib/pdf-utils"
import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { Button, MaxWidthWrapper } from "@freelii/ui"
import { motion } from "framer-motion"
import { Check, Download, Eye, X } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useRef, useState } from "react"
import toast from "react-hot-toast"

export default function PayoutSuccessPage() {
    const params = useParams()
    const router = useRouter()
    const paymentId = params?.payout_id as string
    const slug = params?.slug as string
    const [showPreview, setShowPreview] = useState(false)
    const confirmationRef = useRef<HTMLDivElement>(null)

    const { data: payment } = api.orchestrator.getPaymentState.useQuery(
        { paymentId },
        { enabled: !!paymentId }
    )

    const handleDownloadConfirmation = async () => {
        if (!payment || !confirmationRef.current) {
            toast.error("Payment confirmation not available")
            return
        }

        const toastId = toast.loading('Generating payment confirmation PDF...')

        try {
            const filename = `payment-confirmation-${payment.id}.pdf`
            await generateInvoicePDF(confirmationRef.current, {
                filename,
                quality: 0.95,
                scale: 2
            })
            toast.success('Payment confirmation downloaded successfully!', { id: toastId })
        } catch (error) {
            console.error('Failed to generate PDF:', error)
            toast.error('Failed to generate PDF. Please try again.', { id: toastId })
        }
    }

    const handleReturnToDashboard = () => {
        router.push(`/dashboard/${slug}`)
    }

    if (!payment) {
        return (
            <PageContent>
                <MaxWidthWrapper className="p-10">
                    <div className="text-center">Payment not found</div>
                </MaxWidthWrapper>
            </PageContent>
        )
    }

    const totalCost = payment.source_amount / 100
    const recipientAmount = payment.target_amount / 100

    return (
        <PageContent>
            <MaxWidthWrapper className="p-10">
                {!showPreview ? (
                    // Success Card View
                    <div className="min-h-[600px] flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-md mx-auto"
                        >
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                                {/* Success Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <Check className="w-8 h-8 text-green-600" />
                                </motion.div>

                                {/* Success Message */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        Payment Sent Successfully!
                                    </h1>
                                    <p className="text-gray-600 mb-6">
                                        Your payment has been processed and sent to {payment.recipient?.name}
                                    </p>
                                </motion.div>

                                {/* Payment Details */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-gray-50 rounded-lg p-4 mb-6 text-left"
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Amount Sent:</span>
                                            <span className="font-medium">
                                                {totalCost.toLocaleString('en-US', {
                                                    style: 'currency',
                                                    currency: payment.source_currency === "USDC" ? "USD" : payment.source_currency
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Recipient Gets:</span>
                                            <span className="font-medium">
                                                {recipientAmount.toLocaleString('en-US', {
                                                    style: 'currency',
                                                    currency: payment.target_currency === "USDC" ? "USD" : payment.target_currency
                                                })}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 mt-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Payment ID:</span>
                                                <span className="font-mono text-xs">{payment.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="space-y-3"
                                >
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowPreview(true)}
                                            className="flex-1"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Preview Confirmation
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleDownloadConfirmation}
                                            className="flex-1"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PDF
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={handleReturnToDashboard}
                                        className="w-full"
                                    >
                                        Return to Dashboard
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    // Preview Modal View
                    <div className="min-h-screen">
                        {/* Header with close button */}
                        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm border p-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Payment Confirmation Preview</h2>
                                <p className="text-sm text-gray-600">Review your payment confirmation before downloading</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleDownloadConfirmation}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPreview(false)}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Close Preview
                                </Button>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="bg-gray-100 rounded-lg p-8">
                            <PaymentConfirmationPreview
                                ref={confirmationRef}
                                payment={payment}
                                transactionId={payment.tx_id || undefined}
                                transactionHash={payment.tx_hash || undefined}
                                showZoomControls={true}
                            />
                        </div>
                    </div>
                )}

                {/* Hidden element for PDF generation only */}
                <div className="fixed opacity-0 pointer-events-none -z-50 overflow-hidden">
                    <PaymentConfirmationPreview
                        payment={payment}
                        transactionId={payment.tx_id || undefined}
                        transactionHash={payment.tx_hash || undefined}
                        showZoomControls={false}
                    />
                </div>
            </MaxWidthWrapper>
        </PageContent>
    )
}