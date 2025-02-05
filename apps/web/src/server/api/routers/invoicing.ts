import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { InvoiceService } from "@/server/services/invoicing/invoice-service";
import { z } from "zod";

export const invoicingRouter = createTRPCRouter({
    search: protectedProcedure
        .input(z.object({ query: z.string().optional().default("") }))
        .query(async ({ ctx, input }) => {
            const invoiceService = new InvoiceService({ db: ctx.db, session: ctx.session });
            return invoiceService.search(input.query);
        }),
});
