export interface LineItem {
    description: string
    quantity: number
    unitPrice: number
    amount: number
}

export interface InvoiceFormData {
    clientId?: number
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

