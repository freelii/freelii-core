import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { OrchestratorService } from "@/server/services/orchestrator/orchestrator-service";
import { ConfirmBlockchainConfirmationSchema } from "@/server/services/orchestrator/schemas/confirm.schema";
import { GetPaymentSchema } from "@/server/services/orchestrator/schemas/get-payment.schema";
import { InitiatePaymentSchema } from "@/server/services/orchestrator/schemas/initiate-payment.schema";
import { ProcessPaymentSettledSchema } from "@/server/services/orchestrator/schemas/process-settlement";
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
    }),
    initiatePayment: protectedProcedure
        .input(InitiatePaymentSchema)
        .mutation(async ({ input, ctx }) => {
            const orchestratorService = new OrchestratorService({ db: ctx.db, session: ctx.session });
            return orchestratorService.initiatePayment({
                sourceAmount: input.sourceAmount.toString(),
                senderId: Number(ctx.session.user.id),
                walletId: input.walletId,
                recipientId: input.recipientId,
                destinationId: input.destinationId
            });
        }),
    getPaymentState: protectedProcedure
        .input(GetPaymentSchema)
        .query(async ({ input, ctx }) => {
            const orchestratorService = new OrchestratorService({ db: ctx.db, session: ctx.session });
            return orchestratorService.getPaymentState(input.paymentId);
        }),
    getPaymentInstructions: protectedProcedure
        .input(GetPaymentSchema)
        .query(async ({ input, ctx }) => {
            const orchestratorService = new OrchestratorService({ db: ctx.db, session: ctx.session });
            return orchestratorService.getPaymentInstructions(input.paymentId);
        }),
    confirmBlockchainConfirmation: protectedProcedure
        .input(ConfirmBlockchainConfirmationSchema)
        .mutation(async ({ input, ctx }) => {
            const orchestratorService = new OrchestratorService({ db: ctx.db, session: ctx.session });
            return orchestratorService.processBlockchainConfirmation(input.paymentId, input.txId, input.txHash);
        }),
    processPaymentSettled: protectedProcedure
        .input(ProcessPaymentSettledSchema)
        .mutation(async ({ input, ctx }) => {
            const orchestratorService = new OrchestratorService({ db: ctx.db, session: ctx.session });
            return orchestratorService.processPaymentSettled(input.paymentId);
        })
})