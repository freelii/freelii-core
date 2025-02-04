import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { LedgerService } from "@/server/services/ledger/ledger-service";
import { z } from "zod";

export const ledgerRouter = createTRPCRouter({
    transactions: protectedProcedure
        .input(z.object({
            walletId: z.string().min(1),
        }))
        .query(async ({ ctx, input }) => {
            const ledgerService = new LedgerService({
                db: ctx.db,
                walletId: input.walletId,
                session: ctx.session
            });
            return ledgerService.getTransactions();
        }),
});
