"use client"

import { useWalletStore } from "@/hooks/stores/wallet-store"
import { generateInvoiceFilename, generateInvoicePDF } from "@/lib/pdf-utils"
import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { MaxWidthWrapper, useRouterStuff } from "@freelii/ui"
import { cn, fromStroops } from "@freelii/utils/functions"
import { fromFormattedToNumber } from "@freelii/utils/functions/format-currency"
import { TransactionMovementType } from "@prisma/client"
import { noop } from "@tanstack/react-table"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { InvoiceForm } from "./invoice-form"
import { InvoicePreview } from "./invoice-preview"
import { type InvoiceFormData } from "./types"


const initialFormData: InvoiceFormData = {
    clientId: undefined,
    invoiceNumber: "", // ,suggestInvoiceNumber(),
    poNumber: "",
    currency: "USD",
    dueDate: new Date(),
    issueDate: new Date(),
    taxRate: 0,
    lineItems: [{ description: "", quantity: 1, unit_price: 0, amount: 0 }],
    notes: "",
    recurrence: "none",
    repeatSchedule: null
}


export default function CreateInvoicePage() {
    const { searchParams } = useRouterStuff()
    const { selectedWalletId } = useWalletStore()
    const [formData, setFormData] = useState<InvoiceFormData>(initialFormData)
    const invoicePreviewRef = useRef<HTMLDivElement>(null)

    const txId = searchParams?.get("tx_id")

    // tRPC procedures
    const { data: clients } = api.clients.search.useQuery({ limit: 30 })
    const { data: transaction } = api.ledger.getTransaction.useQuery({
        id: String(txId),
        walletId: String(selectedWalletId)
    }, {
        enabled: !!txId && !!selectedWalletId
    })

    const handleFormChange = (data: Partial<InvoiceFormData>) => {
        setFormData(prev => ({ ...prev, ...data }))
    }

    const handleGeneratePDF = async () => {
        if (!invoicePreviewRef.current) {
            toast.error(`${isReceipt ? 'Receipt' : 'Invoice'} preview not available`)
            return
        }

        const toastId = toast.loading('Generating PDF...')

        try {
            const documentType = isReceipt ? 'receipt' : 'invoice'
            const filename = generateInvoiceFilename(formData.invoiceNumber || documentType)
            await generateInvoicePDF(invoicePreviewRef.current, {
                filename,
                quality: 0.95,
                scale: 3
            })
            toast.success('PDF downloaded successfully!', { id: toastId })
        } catch (error) {
            console.error('Failed to generate PDF:', error)
            toast.error('Failed to generate PDF. Please try again.', { id: toastId })
        }
    }

    useEffect(() => {
        if (transaction) {
            console.log("transaction", transaction)
            console.log({
                description: '',
                quantity: 1,
                unit_price: fromStroops(transaction.amount, 2),
                amount: fromStroops(transaction.amount, 2)
            })
            setFormData(prev => ({
                ...prev,
                transactionId: transaction.id,
                clientId: transaction.recipient_id,
                invoiceNumber: "RCP-" + (transaction.blockchain_tx_hash.slice(0, 5) ?? "").toUpperCase(),
                currency: transaction.currency,
                issueDate: transaction.created_at,
                dueDate: transaction.created_at,
                lineItems: [{
                    description: '',
                    quantity: 1,
                    unit_price: fromFormattedToNumber(fromStroops(transaction.amount, 2)),
                    amount: fromFormattedToNumber(fromStroops(transaction.amount, 2))
                }]
            }))
        }
    }, [transaction])

    const client = clients?.find(c => Number(c.id) === Number(formData.clientId))

    // Determine if this is a receipt (for outgoing transaction) or invoice
    const isReceipt = transaction?.movement_type === TransactionMovementType.OUT
    const documentTitle = isReceipt ? "New Receipt" : "New Invoice"

    return (
        <PageContent
            title={documentTitle}
            className="bg-gray-200 pb-10"
        >
            <MaxWidthWrapper>
                <div className="grid grid-cols-2 bg-neutral-200 relative overflow-hidden">
                    <div
                        className={cn(
                            "pointer-events-none absolute -left-2/3 bottom-0 aspect-square w-[150%] translate-y-1/4 rounded-full opacity-15 blur-[75px]",
                            "bg-[conic-gradient(from_32deg_at_center,#855AFC_0deg,#3A8BFD_72deg,#00FFF9_144deg,#5CFF80_198deg,#EAB308_261deg,#f00_360deg)]",
                        )}
                    />
                    {/* Left side - Form */}
                    <div className="relative space-y-6 bg-white shadow-r-lg pr-6">
                        <InvoiceForm
                            invoiceTo={undefined}
                            formData={formData}
                            clients={clients}
                            onChange={handleFormChange}
                            addLineItem={noop}
                            updateLineItem={noop}
                            removeLineItem={noop}
                            setIsNewClient={noop}
                            onGeneratePDF={handleGeneratePDF}
                            isReceipt={isReceipt}
                        />
                    </div>


                    {/* Right side - Preview */}
                    <div className="shadow-sm py-4">
                        <InvoicePreview
                            ref={invoicePreviewRef}
                            data={formData}
                            client={client}
                            isReceipt={isReceipt}
                        />
                    </div>
                </div>
            </MaxWidthWrapper>
        </PageContent>
    )
}   