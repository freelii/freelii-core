import { type z } from "zod";
import { BaseService } from "../base-service";
import { type InvoiceCreateSchema } from "./schemas/invoice-create.schema";

export class InvoiceService extends BaseService {

    async search(query: string) {
        const invoices = await this.db.invoice.findMany({
            where: {
                OR: [
                    { invoice_number: { contains: query } },
                    { description: { contains: query } },
                    { transaction_id: { contains: query } }
                ]
            },
            include: {
                client: true,
                transaction: true,
                lineItems: true
            }
        });
        return invoices;
    }

    /**
     * Find invoice by transaction ID
     * @param transactionId - The transaction ID to search for
     * @returns The invoice linked to this transaction, if any
     */
    async findByTransactionId(transactionId: string) {
        const invoice = await this.db.invoice.findFirst({
            where: {
                transaction_id: transactionId
            },
            include: {
                client: true,
                transaction: true,
                lineItems: true
            }
        });
        return invoice;
    }

    /**
     * Create a new invoice
     * @param data - The data to create the invoice with
     * @returns The created invoice
     */
    async create(data: z.infer<typeof InvoiceCreateSchema>) {
        const { clientId, lineItems, transactionId, ...rest } = data;
        const invoice = await this.db.invoice.create({
            data: {
                generator_id: Number(this.session.user.id),
                client_id: Number(clientId),
                transaction_id: transactionId,
                invoice_number: data.invoiceNumber,
                po_number: data.poNumber,
                currency: data.currency,
                subtotal: data.subtotal,
                tax_rate: data.taxRate,
                tax_amount: data.taxAmount,
                total_amount: data.totalAmount,
                due_date: data.dueDate,
                description: data.description,
                notes: data.notes,
                lineItems: {
                    create: lineItems.map((item) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        amount: item.quantity * item.unit_price,
                    }))
                }
            },
            include: {
                client: true,
                transaction: true,
                lineItems: true
            }
        });
        return invoice;
    }
}