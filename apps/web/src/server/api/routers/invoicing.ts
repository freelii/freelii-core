import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { InvoiceService } from "@/server/services/invoicing/invoice-service";
import { z } from "zod";

export const invoicingRouter = createTRPCRouter({
    search: publicProcedure
        .input(z.object({ query: z.string().optional().default("") }))
        .query(async ({ ctx, input }) => {
            const invoiceService = new InvoiceService(ctx.db);
            return invoiceService.search(input.query);
        }),
});
