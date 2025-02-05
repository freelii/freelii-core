import { BaseService } from "../base-service";

export class InvoiceService extends BaseService {

    async search(query: string) {
        const invoices = await this.db.invoice.findMany({
            where: {
                OR: [{ invoice_number: { contains: query } }, { description: { contains: query } }]
            }
        });
        console.log(invoices);
        return invoices;
    }
}