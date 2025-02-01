"use client"

import { Button } from "@freelii/ui/button"
import { formatCurrency } from "@freelii/utils/functions"
import dayjs from "dayjs"
import { Minus, Plus } from "lucide-react"
import { useState } from "react"
import { Client, type InvoiceFormData } from "./types"

interface InvoicePreviewProps {
    data: InvoiceFormData
    client?: Client
}

export function InvoicePreview({ data, client }: InvoicePreviewProps) {
    const [zoom, setZoom] = useState(65)

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


    const subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * (data.taxRate / 100)
    const total = subtotal + taxAmount

    return (
        <div className="relative">
            {/* Zoom controls - now floating */}
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

            {/* Preview container */}
            <div className="overflow-auto px-4 h-[100vh]"
                onWheel={handleWheel}
            >
                <div className="inline-block min-w-full">
                    <div
                        className="relative w-[210mm] h-[297mm] mx-auto bg-white shadow-xl"
                        style={{
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top left',
                            marginBottom: `${zoom - 100}%`
                        }}
                    >
                        {/* A4 content container with padding */}
                        <div className="absolute inset-0 p-16 space-y-12">
                            {/* Header */}
                            <div className="flex justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
                                    <div className="mt-4 text-sm text-gray-600 space-y-1">
                                        <p>Invoice #: {data.invoiceNumber}</p>
                                        {data.poNumber && <p>PO #: {data.poNumber}</p>}
                                        <p>Date: {dayjs(data.issueDate).format("MMMM D, YYYY")}</p>
                                        <p>Due Date: {dayjs(data.dueDate).format("MMMM D, YYYY")}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {/* Placeholder for company logo */}
                                    <div className="w-32 h-12 bg-gray-50 rounded flex items-center justify-center text-gray-400 text-sm">
                                        LOGO
                                    </div>
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="flex justify-between">
                                <div className="w-1/2">
                                    <h3 className="font-medium text-gray-500 mb-2">From</h3>
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium">Your Company Name</p>
                                        <p>123 Business Street</p>
                                        <p>City, Country</p>
                                    </div>
                                </div>
                                <div className="w-1/2">
                                    <h3 className="font-medium text-gray-500 mb-2">Bill To</h3>
                                    {client && (
                                        <div
                                            key={client.name}
                                            className="text-sm text-gray-600 animate-in fade-in duration-300"
                                        >
                                            <p className="font-medium">{client.name}</p>
                                            <p>{client.address?.street}</p>
                                            <span className="flex flex-wrap gap-1">
                                                {client.address?.zipCode && <p>{client.address?.zipCode},</p>}
                                                {client.address?.city && <p>{client.address?.city}, </p>}
                                                {client.address?.state && <p>{client.address?.state},</p>}
                                            </span>
                                            <p>{client.address?.country}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="mt-8">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-left text-gray-600">
                                            <th className="pb-3 font-medium">Description</th>
                                            <th className="pb-3 text-right font-medium">Qty</th>
                                            <th className="pb-3 text-right font-medium">Price</th>
                                            <th className="pb-3 text-right font-medium">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {data.lineItems.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100">
                                                <td className="py-4">{item.description}</td>
                                                <td className="py-4 text-right">{item.quantity}</td>
                                                <td className="py-4 text-right">
                                                    {formatCurrency(item.unitPrice, data.currency)}
                                                </td>
                                                <td className="py-4 text-right">
                                                    {formatCurrency(item.amount, data.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Empty rows to maintain consistent layout */}
                                        {Array.from({ length: Math.max(0, 5 - data.lineItems.length) }).map((_, index) => (
                                            <tr key={`empty-${index}`} className="border-b border-gray-100">
                                                <td className="py-4">&nbsp;</td>
                                                <td className="py-4">&nbsp;</td>
                                                <td className="py-4">&nbsp;</td>
                                                <td className="py-4">&nbsp;</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="mt-8">
                                <div className="w-64 ml-auto space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>{formatCurrency(subtotal, data.currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax ({data.taxRate}%)</span>
                                        <span>{formatCurrency(taxAmount, data.currency)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 pt-3 font-medium">
                                        <span>Total</span>
                                        <span>{formatCurrency(total, data.currency)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {data.notes && (
                                <div className="mt-12 rounded-lg bg-gray-50 p-4 text-sm">
                                    <h3 className="font-medium text-gray-700">Notes</h3>
                                    <p className="mt-2 text-gray-600">{data.notes}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="absolute bottom-16 left-16 right-16 text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
                                <p>Thank you for your business</p>
                                <p className="mt-1">Payment is due within {dayjs(data.dueDate).diff(data.issueDate, 'day')} days</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 