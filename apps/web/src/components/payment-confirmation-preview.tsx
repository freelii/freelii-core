"use client"

import { Button } from "@freelii/ui/button"
import { formatCurrency } from "@freelii/utils/functions"
import dayjs from "dayjs"
import { Minus, Plus } from "lucide-react"
import { forwardRef, useState } from "react"

interface PaymentConfirmationPreviewProps {
    payment: {
        id: string
        source_amount: number
        target_amount: number
        source_currency: string
        target_currency: string
        exchange_rate: number
        tx_id?: string | null
        tx_hash?: string | null
        recipient: {
            name: string
            email?: string | null
        }
        destination?: {
            ewallet_account?: {
                account_number: string | null
                account_name?: string
            } | null
        } | null
    }
    transactionId?: string
    transactionHash?: string
    showZoomControls?: boolean
}

export const PaymentConfirmationPreview = forwardRef<HTMLDivElement, PaymentConfirmationPreviewProps>(
    ({ payment, transactionId, transactionHash, showZoomControls = true }, ref) => {
        const [zoom, setZoom] = useState(65)
        const confirmationNumber = payment.id.split('-')[0]?.toUpperCase() || payment.id.slice(0, 8).toUpperCase()
        const amount = payment.source_amount
        const recipientAmount = payment.target_amount

        const handleZoomIn = () => {
            setZoom(prev => Math.min(prev + 5, 200))
        }

        const handleZoomOut = () => {
            setZoom(prev => Math.max(prev - 5, 50))
        }

        const handleWheel = (e: React.WheelEvent) => {
            // Check if Control or Command key is pressed
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault() // Prevent default browser zoom

                // Determine zoom direction based on wheel delta
                if (e.deltaY < 0) {
                    setZoom(prev => Math.min(prev + 5, 200))
                } else {
                    setZoom(prev => Math.max(prev - 5, 50))
                }
            }
        }

        return (
            <div className="relative">
                {showZoomControls && (
                    /* Zoom controls */
                    <div className="absolute right-2 -top-2 z-10 bg-neutral-50 flex items-center justify-end gap-2 rounded-lg shadow-lg border-[1px] border-gray-200">
                        <Button
                            variant="outline"
                            onClick={handleZoomOut}
                            disabled={zoom <= 50}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="min-w-[3rem] text-center">{zoom}%</span>
                        <Button
                            variant="outline"
                            onClick={handleZoomIn}
                            disabled={zoom >= 200}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                )}

                {/* Preview container */}
                <div className="overflow-auto px-4 h-[100vh]" onWheel={handleWheel}>
                    <div className="inline-block min-w-full">
                        <div
                            ref={ref}
                            className="relative w-[210mm] h-[297mm] mx-auto bg-white shadow-xl"
                            style={{
                                transform: showZoomControls ? `scale(${zoom / 100})` : 'scale(1)',
                                transformOrigin: 'top left',
                                marginBottom: showZoomControls ? `${zoom - 100}%` : '0'
                            }}
                        >
                            {/* A4 content container with padding */}
                            <div className="absolute inset-0 p-16 space-y-8">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-bold text-green-600">PAYMENT CONFIRMATION</h2>
                                        <div className="mt-4 text-sm text-gray-600 space-y-1">
                                            <p>Confirmation #: PC-{confirmationNumber}</p>
                                            <p>Date: {dayjs().format("MMMM D, YYYY")}</p>
                                            <p>Time: {dayjs().format("h:mm A")}</p>
                                            <p className="text-green-600 font-medium">✓ Payment Completed Successfully</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatCurrency(amount, payment.source_currency === "USDC" ? "USD" : payment.source_currency)}
                                        </div>
                                        <div className="text-sm text-gray-500">Amount Sent</div>
                                    </div>
                                </div>

                                {/* Company Info */}
                                <div className="flex justify-between">
                                    <div className="w-1/2">
                                        <h3 className="font-medium text-gray-500 mb-2">Payment Processed By</h3>
                                        <div className="text-sm text-gray-600">
                                            <p className="font-medium">Freelii Tech, Inc.</p>
                                            <p>2803 Philadelphia Pike</p>
                                            <p>Claymont, DE 19703</p>
                                            <p>United States</p>
                                            <p className="mt-2">Phone: +1 302 351 0000</p>
                                            <p>EIN: 00-1430XXX</p>
                                        </div>
                                    </div>
                                    <div className="w-1/2">
                                        <h3 className="font-medium text-gray-500 mb-2">Payment Recipient</h3>
                                        <div className="text-sm text-gray-600">
                                            <p className="font-medium">{payment.recipient.name}</p>
                                            {payment.recipient.email && (
                                                <p>{payment.recipient.email}</p>
                                            )}
                                            {payment.destination?.ewallet_account?.account_number && (
                                                <>
                                                    <p className="mt-2 text-xs text-gray-500">Recipient Account:</p>
                                                    <p className="font-mono text-xs">{payment.destination.ewallet_account.account_number}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details Table */}
                                <div className="mt-6">
                                    <h3 className="font-medium text-gray-700 mb-4">Payment Details</h3>
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <table className="w-full">
                                            <tbody className="space-y-3">
                                                <tr className="border-b border-gray-200">
                                                    <td className="py-3 font-medium text-gray-600">Payment ID</td>
                                                    <td className="py-3 text-right font-mono text-sm">{payment.id}</td>
                                                </tr>
                                                <tr className="border-b border-gray-200">
                                                    <td className="py-3 font-medium text-gray-600">Amount Sent</td>
                                                    <td className="py-3 text-right font-medium">
                                                        {formatCurrency(amount, payment.source_currency === "USDC" ? "USD" : payment.source_currency)}
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-gray-200">
                                                    <td className="py-3 font-medium text-gray-600">Amount Received</td>
                                                    <td className="py-3 text-right font-medium">
                                                        {formatCurrency(recipientAmount, payment.target_currency === "USDC" ? "USD" : payment.target_currency)}
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-gray-200">
                                                    <td className="py-3 font-medium text-gray-600">Exchange Rate</td>
                                                    <td className="py-3 text-right">
                                                        {payment.exchange_rate ? `1 ${payment.source_currency} = ${(payment.exchange_rate / 100).toFixed(4)} ${payment.target_currency}` : 'N/A'}
                                                    </td>
                                                </tr>
                                                {transactionId && (
                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-3 font-medium text-gray-600">Transaction ID</td>
                                                        <td className="py-3 text-right font-mono text-xs">{transactionId}</td>
                                                    </tr>
                                                )}
                                                {transactionHash && (
                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-3 font-medium text-gray-600">Blockchain Hash</td>
                                                        <td className="py-3 text-right font-mono text-xs break-all">{transactionHash}</td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td className="py-3 font-medium text-gray-600">Status</td>
                                                    <td className="py-3 text-right">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            ✓ Completed
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Security Notice */}
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">🔒 Security Notice</h4>
                                    <p className="text-sm text-blue-800">
                                        This payment has been processed securely through our encrypted payment system.
                                        All transaction data is protected and recorded for your security and compliance.
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-16 left-16 right-16 text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
                                    <p className="font-medium">Thank you for using Freelii!</p>
                                    <p className="mt-1">Secure • Fast • Global</p>
                                    <p className="mt-2 text-xs">
                                        This is an automated payment confirmation. Please retain this document for your records.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)

PaymentConfirmationPreview.displayName = 'PaymentConfirmationPreview' 