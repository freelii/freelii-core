import { PaymentRail } from "@freelii/anchors";




export interface LiquidationAddress {
    id: string;
    userId: string;
    chain: string; // "ethereum", "stellar", etc.
    currency: string; // "usdc", "usdt", etc.
    address: string; // Blockchain address
    blockchainMemo?: string; // For memo-based chains like Stellar
    externalAccountId?: string; // Linked bank account
    destinationPaymentRail: PaymentRail;
    destinationCurrency: string; // "usd", "eur", etc.
    destinationAddress?: string; // If another crypto address is used
    createdAt: Date;
    updatedAt: Date;
}
