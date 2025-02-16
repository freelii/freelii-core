import { z } from "zod";

export const ProcessPaymentSettledSchema = z.object({
    paymentId: z.string()
})