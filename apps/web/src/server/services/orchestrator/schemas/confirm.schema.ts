import { z } from "zod";

export const ConfirmBlockchainConfirmationSchema = z.object({
    paymentId: z.string(),
    txId: z.string(),
    txHash: z.string()
})