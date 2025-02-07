import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { InvoiceService } from "@/server/services/invoicing/invoice-service";
import { InvoiceCreateSchema } from "@/server/services/invoicing/schemas/invoice-create.schema";
import { z } from "zod";

export const invoicingRouter = createTRPCRouter({
    search: protectedProcedure
        .input(z.object({ query: z.string().optional().default("") }))
        .query(async ({ ctx, input }) => {
            const invoiceService = new InvoiceService({ db: ctx.db, session: ctx.session });
            return invoiceService.search(input.query);
        }),
    create: protectedProcedure
        .input(InvoiceCreateSchema)
        .mutation(async ({ ctx, input }) => {
            const invoiceService = new InvoiceService({ db: ctx.db, session: ctx.session });
            return invoiceService.create(input);
        }),
});
