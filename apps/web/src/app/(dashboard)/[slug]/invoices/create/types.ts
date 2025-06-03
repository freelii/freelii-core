export interface LineItem {
    description: string
    quantity: number
    unit_price: number | string
    amount: number | string
}

export interface InvoiceFormData {
    clientId?: number
    transactionId?: string
    invoiceNumber: string
    poNumber?: string
    currency: string
    issueDate: Date
    dueDate: Date
    taxRate: number
    lineItems: LineItem[]
    notes?: string
    recurrence: "none" | "weekly" | "monthly" | "yearly"
    repeatSchedule: 'weekly' | 'monthly' | 'yearly' | null
    ccEmail?: string
    sendEmail?: boolean
}

