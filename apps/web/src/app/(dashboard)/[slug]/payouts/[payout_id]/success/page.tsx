"use client"

import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { Button, MaxWidthWrapper } from "@freelii/ui"
import { CURRENCIES } from "@freelii/utils"
import { motion } from "framer-motion"
import { Check, Download } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { jsPDF } from "jspdf"

export default function PayoutSuccessPage() {
    const params = useParams()
    const router = useRouter()
    const paymentId = params?.payout_id as string
    const slug = params?.slug as string
    
    const { data: payment } = api.orchestrator.getPaymentState.useQuery(
        { paymentId },
        { enabled: !!paymentId }
    )

    const handleDownloadConfirmation = async () => {
        if (!payment) return

        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        
        // Header
        doc.setFontSize(20)
        doc.text("Payment Confirmation", pageWidth / 2, 30, { align: "center" })
        
        // Payment details
        doc.setFontSize(12)
        let yPosition = 60
        
        doc.text("Payment Details:", 20, yPosition)
        yPosition += 15
        
        doc.text(`Payment ID: ${payment.id}`, 25, yPosition)
        yPosition += 10
        
        doc.text(`Recipient: ${payment.recipient?.name}`, 25, yPosition)
        yPosition += 10
        
        doc.text(`Amount: ${(payment.source_amount / 100).toLocaleString('en-US', { 
            style: 'currency', 
            currency: payment.source_currency === "USDC" ? "USD" : payment.source_currency 
        })}`, 25, yPosition)
        yPosition += 10
        
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 25, yPosition)
        yPosition += 10
        
        if (payment.destination?.ewallet_account) {
            doc.text(`Recipient Account: ${payment.destination.ewallet_account.account_number}`, 25, yPosition)
            yPosition += 10
        }
        
        // Footer
        yPosition += 20
        doc.text("Thank you for using Freelii!", pageWidth / 2, yPosition, { align: "center" })
        
        // Save the PDF
        doc.save(`payment-confirmation-${payment.id}.pdf`)
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
                <div className="min-h-[600px] flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
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
                            <h1 className="text-2xl font-semibold">Payment Confirmed!</h1>
                            <p className="text-gray-500">
                                Your payment of {totalCost.toLocaleString('en-US', { 
                                    style: 'currency', 
                                    currency: payment.source_currency === "USDC" ? "USD" : payment.source_currency,
                                    minimumFractionDigits: 2 
                                })} has been processed successfully.
                            </p>
                            <p className="text-sm text-gray-400">
                                {payment.recipient?.name} will receive {recipientAmount.toLocaleString('en-US', { 
                                    style: 'currency', 
                                    currency: payment.target_currency === "USDC" ? "USD" : payment.target_currency,
                                    minimumFractionDigits: 2 
                                })}
                            </p>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={handleDownloadConfirmation}
                            >
                                <Download className="size-4" />
                                Download Confirmation
                            </Button>

                            <Button
                                className="w-full"
                                onClick={handleReturnToDashboard}
                            >
                                Return to Dashboard
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </MaxWidthWrapper>
        </PageContent>
    )
}