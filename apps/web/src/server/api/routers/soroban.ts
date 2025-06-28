import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { SorobanWebhookService } from "@/server/services/soroban/soroban-webhook-service";
import { z } from "zod";

export const sorobanRouter = createTRPCRouter({
    getWalletTransactions: protectedProcedure
        .input(z.object({
            walletId: z.string().min(1),
            limit: z.number().min(1).max(100).optional().default(10),
        }))
        .query(async ({ input }) => {
            const transactions = await SorobanWebhookService.getWalletTransactions(input.walletId);
            return transactions.slice(0, input.limit);
        }),

    getTransactionByHash: protectedProcedure
        .input(z.object({
            hash: z.string().min(1),
        }))
        .query(async ({ input }) => {
            return await SorobanWebhookService.getTransactionByHash(input.hash);
        }),
}); 