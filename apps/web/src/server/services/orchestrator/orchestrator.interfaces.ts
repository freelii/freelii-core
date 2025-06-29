import { type EwalletProvider, type PaymentOrchestrationState, type TransactionStatus } from "@prisma/client";

export interface LiquidationAddress {
    id: string;
    userId: string;
    chain: string; // "ethereum", "stellar", etc.
    currency: string; // "usdc", "usdt", etc.
    address: string; // Blockchain address
    blockchainMemo?: string; // For memo-based chains like Stellar
    externalAccountId?: string; // Linked bank account
    destinationPaymentRail: "STELLAR" | "WIRE" | "ACH" | "SEPA" | "PH_INSTAPAY" | "PH_PESONET" | "MX_SPEI";
    destinationCurrency: string; // "usd", "eur", etc.
    destinationAddress?: string; // If another crypto address is used
    createdAt: Date;
    updatedAt: Date;
}


export interface CryptoRecipient {
    payment_rail: 'stellar';
    to_address: string;
    currency: string;
    blockchain_memo?: string; // For memo-based chains like Stellar
}

export interface WireRecipient {
    payment_rail: 'wire';
    external_account_id: string;
    wire_message?: string;
    currency: "usd";
}

export interface AchRecipient {
    payment_rail: 'ach';
    external_account_id: string;
    currency: "usd";
}

export interface SepaRecipient {
    payment_rail: 'sepa';
    external_account_id: string;
    currency: "eur";
    sepa_reference?: string;
}

export interface EwalletRecipient {
    mobile_number: string;
    ewallet_provider: EwalletProvider;
    external_account_id?: string;
}

export interface InstapayRecipient extends EwalletRecipient {
    payment_rail: 'instapay';
}

export interface PesonetRecipient extends EwalletRecipient {
    payment_rail: 'pesonet';
}

export type Destination =
    | CryptoRecipient
    | WireRecipient
    | AchRecipient
    | SepaRecipient
    | InstapayRecipient
    | PesonetRecipient;


export interface PaymentOrchestrationConfig {
    sourceAmount: string;
    recipientId: number;
    destinationId: string;
    senderId: number;
    walletId: string;
}

export interface PaymentOrchestrationResult {
    success: boolean;
    state: PaymentOrchestrationState | null;
    error?: string;
}

export interface WebhookEvent {
    event: string;
    data: {
        paymentId: string;
        status: TransactionStatus;
        failedReason?: string;
    };
    timestamp: number;
}
