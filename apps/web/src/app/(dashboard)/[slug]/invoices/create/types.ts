export interface LineItem {
    description: string
    quantity: number
    unitPrice: number
    amount: number
}

export interface InvoiceFormData {
    clientId: string
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

export interface Client {
    id: string
    name: string
    email: string
    address?: {
        street: string
        city: string
        state?: string
        country: string
        zipCode?: string
    }
}