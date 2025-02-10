import { z } from "zod";

export const LinkWithdrawalAccountSchema = z.object({
    currency: z.enum(["USD", "PHP", "MXN"]).optional(),
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
    transferMethod: z.enum(["instapay", "pesonet",]).optional(),
});

export type LinkWithdrawalAccountInput = z.infer<typeof LinkWithdrawalAccountSchema>;
