import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { OrchestratorService } from "@/server/services/orchestrator/orchestrator-service";
import { z } from "zod";


export const orchestratorRouter = createTRPCRouter({
    getQuote: protectedProcedure.input(z.object({
        sourceCurrency: z.string(),
        targetCurrency: z.string(),
        amount: z.number()
    })).query(async ({ input, ctx }) => {
        const orchestratorService = new OrchestratorService({ db: ctx.db, session: ctx.session });
        const rate = await orchestratorService.getRate({
            sourceCurrency: input.sourceCurrency,
            targetCurrency: input.targetCurrency,
            sourceAmount: input.amount.toString()
        });
        return rate;
    })
})