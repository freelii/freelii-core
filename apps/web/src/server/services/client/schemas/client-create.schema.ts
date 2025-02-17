import { z } from "zod";
import { CreateAccountSchema } from "../../payment-account/schemas/create-account.schema";

export const ClientCreateSchema = z.object({
    type: z.enum(["company", "person"]).optional(),
    name: z.string(),
    email: z.string().optional(),
    tax_number: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    paymentAccount: CreateAccountSchema.optional(),
});
