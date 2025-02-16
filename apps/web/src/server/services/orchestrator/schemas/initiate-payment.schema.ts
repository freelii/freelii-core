import { z } from "zod";

export const InitiatePaymentSchema = z.object({
    sourceAmount: z.number(),
    recipientId: z.number(),
    walletId: z.string(),
    destinationId: z.string()
})