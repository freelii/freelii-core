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
            const payment = await orchestratorService.initiatePayment({
                sourceAmount: input.sourceAmount.toString(),
                senderId: Number(ctx.session.user.id),
                walletId: input.walletId,
                recipientId: input.recipientId,
                destinationId: input.destinationId
            });
            return payment;
        }),
    getPaymentState: protectedProcedure
        .input(GetPaymentSchema)
        .query(async ({ input, ctx }) => {
            const orchestratorService = new OrchestratorService({ db: ctx.db, session: ctx.session });
            const payment = await orchestratorService.getPaymentState(input.paymentId);
            return payment;
        }),
    getPaymentInstructions: protectedProcedure
        .input(GetPaymentSchema)
        .query(async ({ input, ctx }) => {
            const orchestratorService = new OrchestratorService({ db: ctx.db, session: ctx.session });
            const payment = await orchestratorService.getPaymentInstructions(input.paymentId);
            return payment;
        }),
    confirmBlockchainConfirmation: protectedProcedure
        .input(ConfirmBlockchainConfirmationSchema)
        .mutation(async ({ input, ctx }) => {
            const orchestratorService = new OrchestratorService({ db: ctx.db, session: ctx.session });
            const payment = await orchestratorService.processBlockchainConfirmation(input.paymentId, input.txId, input.txHash);
            return payment;
        }),
    processPaymentSettled: protectedProcedure
        .input(ProcessPaymentSettledSchema)
        .mutation(async ({ input, ctx }) => {
            const orchestratorService = new OrchestratorService({ db: ctx.db, session: ctx.session });
            const payment = await orchestratorService.processPaymentSettled(input.paymentId);
            return payment;
        })
})