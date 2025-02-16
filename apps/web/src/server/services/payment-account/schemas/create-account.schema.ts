import { z } from "zod";

export const CreateAccountSchema = z.object({
    paymentMethod: z.enum(['fiat', 'blockchain', 'ewallet']),
    country: z.string(),
    // Fiat specific
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    accountHolderName: z.string().optional(),
    transferMethod: z.enum(['instapay', 'pesonet']).optional(),
    accountType: z.enum(['checking', 'savings']).optional(),
    // Blockchain specific
    walletAddress: z.string().optional(),
    // Ewallet specific
    ewalletProvider: z.enum(['gcash', 'maya', 'coins_ph']).optional(),
    mobileNumber: z.string().optional(),
});

export type CreateAccountParams = z.infer<typeof CreateAccountSchema>;
