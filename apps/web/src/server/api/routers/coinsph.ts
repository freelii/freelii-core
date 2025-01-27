import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { CoinsPHService } from "@/server/services/coinsph/coinsph-service";
import { z } from "zod";

export const coinsPHRouter = createTRPCRouter({
    test: publicProcedure
        .input(
            z.object({
                endpoint: z.string(),
                method: z.enum(["GET", "POST"]),
                params: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
            })
        )
        .mutation(async ({ input }) => {
            console.log('input', input);
            const coinsService = new CoinsPHService();
            return await coinsService.makeSignedRequest(
                input.endpoint,
                input.method,
                input.params
            );
        }),
    getInvoices: publicProcedure
        .input(
            z.object({
                external_transaction_id: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const coinsService = new CoinsPHService();
            return await coinsService.getInvoices(input.external_transaction_id);
        }),
    createInvoice: publicProcedure
        .input(
            z.object({
                amount: z.number(),
                currency: z.string(),
                supported_payment_collectors: z.array(z.string()),
                external_transaction_id: z.string(),
                expires_at: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const coinsService = new CoinsPHService();
            return await coinsService.createInvoice(input);
        }),

    createOrder: publicProcedure
        .input(
            z.object({
                side: z.string(),
                symbol: z.string(),
                type: z.string(),
                timeInForce: z.string(),
                quantity: z.number(),
                price: z.number(),
                recvWindow: z.number(),
            })
        )
        .mutation(async ({ input }) => {
            const coinsService = new CoinsPHService();
            return await coinsService.createOrder(input);
        }),

}); 