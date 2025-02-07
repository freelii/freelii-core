import { z } from "zod";

export const LineItemSchema = z.object({
    description: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    amount: z.number(),
});