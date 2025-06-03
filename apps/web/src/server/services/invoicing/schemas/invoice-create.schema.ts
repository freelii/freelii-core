import { z } from "zod";
import { LineItemSchema } from "./line-item.schema";

export const InvoiceCreateSchema = z.object({
    clientId: z.string(),
    invoiceNumber: z.string(),
    poNumber: z.string().optional(),
    subtotal: z.number(),
    taxRate: z.number(),
    taxAmount: z.number(),
    totalAmount: z.number(),
    status: z.enum(["pending", "paid", "overdue", "cancelled"]),
    dueDate: z.date(),
    description: z.string().optional(),
    notes: z.string().optional(),
    currency: z.enum(["USD", "PHP"]),
    lineItems: z.array(LineItemSchema),
    transactionId: z.string().optional(),
});
