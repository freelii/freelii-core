import { z } from "zod";

export const ClientCreateSchema = z.object({
    type: z.enum(["company", "person"]).optional(),
    name: z.string(),
    email: z.string().optional(),
    tax_number: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    currency: z.enum(["USD", "PHP", "MXN"]).optional(),
    zipCode: z.string().optional(),
    paymentMethod: z.enum(["fiat", "blockchain", "ewallet"]).optional(),
    // Local Bank
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    accountType: z.enum(["checking", "savings"]).optional(),
    accountHolderName: z.string().optional(),
    // Blockchain
    walletAddress: z.string().optional(),
    network: z.enum(["stellar"]).optional(),
    // E-wallet
    ewalletProvider: z.enum(["gcash", "maya", "coins_ph"]).optional(),
    mobileNumber: z.string().optional(),
    transferMethod: z.enum(["instapay", "pesonet"]).optional(),

});
