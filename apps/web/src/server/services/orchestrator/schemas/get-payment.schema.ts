import { z } from "zod";

export const GetPaymentSchema = z.object({
    paymentId: z.string()
})