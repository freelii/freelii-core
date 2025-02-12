import { FxService } from "@/server/services/fx/fx-service";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const fxRouter = createTRPCRouter({
    getFxForTarget: protectedProcedure
        .input(z.object({
            sourceCurrency: z.string(),
            targetCurrency: z.string(),
            targetAmount: z.number(),
        }))
        .query(async ({ input }) => {
            const { sourceCurrency, targetCurrency, targetAmount } = input;
            const fxService = new FxService();
            const fxRates = await fxService.getFxForTarget({
                sourceCurrency,
                targetCurrency,
                targetAmount
            });
            return fxRates;
        }),
    getFxForSource: protectedProcedure
        .input(z.object({
            sourceCurrency: z.string(),
            targetCurrency: z.string(),
            sourceAmount: z.number(),
        }))
        .query(async ({ input }) => {
            const { sourceCurrency, targetCurrency, sourceAmount } = input;
            const fxService = new FxService();
            const fxRates = await fxService.getFxForSource({
                sourceCurrency,
                targetCurrency,
                sourceAmount
            });
            return fxRates;
        }),
});