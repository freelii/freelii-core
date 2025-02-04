"use client"

import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { MaxWidthWrapper } from "@freelii/ui"
import { cn } from "@freelii/utils/functions"
import { noop } from "@tanstack/react-table"
import { useState } from "react"
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
    lineItems: [{ description: "", quantity: 1, unitPrice: 0, amount: 0 }],
    notes: "",
    recurrence: "none",
    repeatSchedule: null
}


export default function CreateInvoicePage() {
    const [formData, setFormData] = useState<InvoiceFormData>(initialFormData)
    const { data: clients } = api.users.listClients.useQuery({ userId: 1 })

    const handleFormChange = (data: Partial<InvoiceFormData>) => {
        setFormData(prev => ({ ...prev, ...data }))
    }

    const client = clients?.find(c => Number(c.id) === Number(formData.clientId))

    return (
        <PageContent
            title="Create Invoice"
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
                        />
                    </div>


                    {/* Right side - Preview */}
                    <div className="shadow-sm py-4">
                        <InvoicePreview data={formData} client={client} />
                    </div>
                </div>
            </MaxWidthWrapper>
        </PageContent>
    )
}   