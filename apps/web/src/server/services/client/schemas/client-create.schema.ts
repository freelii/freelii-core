import { z } from "zod";

export const ClientCreateSchema = z.object({
    type: z.enum(["company", "person"]),
    name: z.string(),
    email: z.string().optional(),
    tax_number: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    paymentMethod: z.enum(["fiat", "blockchain"]).optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    accountType: z.enum(["checking", "savings"]).optional(),
    accountHolderName: z.string().optional(),
    walletAddress: z.string().optional(),
    network: z.enum(["stellar"]).optional(),
});
