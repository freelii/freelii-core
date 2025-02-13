
// export interface QuoteRequest {
//     sourceCurrency: string;
//     targetCurrency: string;
//     sourceAmount?: string;
//     targetAmount?: string;
// }

// export interface Quote {
//     quoteId: string;
//     sourceCurrency: string;
//     targetCurrency: string;
//     sourceAmount: string;
//     price: string;
//     targetAmount: string;
//     expiry: string;
// }

export interface QuoteForTarget {
    targetAmount: string;
    sourceCurrency: string;
    targetCurrency: string;
}

export interface QuoteForSource {
    sourceAmount: string;
    sourceCurrency: string;
    targetCurrency: string;
}

export type GetQuoteParams = QuoteForTarget | QuoteForSource;

// Define common types
export type AnchorQuote = {
    quoteId?: string;
    fee: number;
    exchangeRate: number;
    expiresIn: number; // in seconds
}

export enum PaymentRail {
    WIRE = 'wire',
    SEPA = 'sepa',
    ACH = 'ach',
    CRYPTO = 'crypto',
}