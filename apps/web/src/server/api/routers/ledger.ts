import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { LedgerService } from "@/server/services/ledger/ledger-service";
import { toStroops } from "@freelii/utils/index";
import { z } from "zod";

export const ledgerRouter = createTRPCRouter({
    transactions: protectedProcedure
        .input(z.object({
            walletId: z.string().min(1),
            limit: z.number().min(1).max(100).optional().default(10),
            offset: z.number().min(0).optional().default(0),
        }))
        .query(async ({ ctx, input }) => {
            const ledgerService = new LedgerService({
                db: ctx.db,
                walletId: input.walletId,
                session: ctx.session
            });
            return ledgerService.getTransactions({
                limit: input.limit,
                offset: input.offset
            });
        }),
    getTransaction: protectedProcedure
        .input(z.object({
            id: z.string().min(1),
            walletId: z.string().min(1),
        }))
        .query(async ({ ctx, input }) => {
            const ledgerService = new LedgerService({
                db: ctx.db,
                walletId: input.walletId,
                session: ctx.session
            });
            return ledgerService.getTransaction(input.id);
        }),
    registerPayment: protectedProcedure
        .input(z.object({
            walletId: z.string().min(1),
            txId: z.string().min(1),
            txHash: z.string().min(1),
            senderId: z.number().min(1),
            recipientId: z.number().min(1),
            amount: z.bigint(),
            currency: z.string().min(1),
            reference: z.string().min(1).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const ledgerService = new LedgerService({
                db: ctx.db,
                walletId: input.walletId,
                session: ctx.session
            });
            return ledgerService.registerPayment({
                txId: input.txId,
                txHash: input.txHash,
                senderId: input.senderId,
                recipientId: input.recipientId,
                amount: BigInt(toStroops(input.amount)),
                currency: input.currency,
                reference: input.reference,
            });
        }),
    getPayouts: protectedProcedure
        .input(z.object({
            walletId: z.string().min(1),
            limit: z.number().min(1).max(100).optional().default(10),
            offset: z.number().min(0).optional().default(0),
        }))
        .query(async ({ ctx, input }) => {
            const ledgerService = new LedgerService({
                db: ctx.db,
                walletId: input.walletId,
                session: ctx.session
            });
            return ledgerService.getPayouts({
                limit: input.limit,
                offset: input.offset
            });
        }),
});
