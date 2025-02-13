import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { OrchestratorService } from "@/server/services/orchestrator/orchestrator-service";
import { z } from "zod";


export const orchestratorRouter = createTRPCRouter({
    getQuote: protectedProcedure.input(z.object({
        sourceCurrency: z.string(),
        targetCurrency: z.string(),
        amount: z.number()
    })).query(async ({ input, ctx }) => {
        console.log('getQuote', input);
        const orchestratorService = new OrchestratorService({ db: ctx.db, session: ctx.session });
        console.log('orchestratorService', {
            sourceCurrency: input.sourceCurrency,
            targetCurrency: input.targetCurrency,
            targetAmount: input.amount.toString()
        });
        return await orchestratorService.getQuote({
            sourceCurrency: input.sourceCurrency,
            targetCurrency: input.targetCurrency,
            sourceAmount: input.amount.toString()
        });
    })
})