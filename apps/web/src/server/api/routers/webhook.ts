import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const webhookEventSchema = z.object({
    event: z.string(),
    data: z.record(z.unknown()),
    timestamp: z.number(),
});

export const webhookRouter = createTRPCRouter({
    processEvent: protectedProcedure
        .input(webhookEventSchema)
        .mutation(async ({ ctx, input }) => {
            const { event, data, timestamp } = input;

            // Log the webhook event
            console.log(`Processing webhook event: ${event}`, {
                data,
                timestamp: new Date(timestamp),
            });

            // Handle different event types
            switch (event) {
                case "payment.created":
                    // Handle payment created
                    // Example: Update payment status in database
                    await ctx.db.transactions.update({
                        where: {
                            id: data.paymentId as string,
                        },
                        data: {
                            status: "COMPLETED",
                        },
                    });
                    break;

                case "payment.failed":
                    // Handle payment failed
                    await ctx.db.transactions.update({
                        where: {
                            id: data.paymentId as string,
                        },
                        data: {
                            status: "FAILED",
                        },
                    });
                    break;

                default:
                    throw new Error(`Unhandled webhook event: ${event}`);
            }

            return { success: true };
        }),
}); 