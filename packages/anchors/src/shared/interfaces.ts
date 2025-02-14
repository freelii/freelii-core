
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

export interface QuoteParams {
    sourceCurrency: string;
    targetCurrency: string;
}

export interface QuoteForTarget extends QuoteParams {
    targetAmount: string;
}

export interface QuoteForSource extends QuoteParams {
    sourceAmount: string;
}


export type GetQuoteParams = QuoteForTarget | QuoteForSource;

// Define common types
export type AnchorRate = {
    exchangeRate: number;
    expiresIn?: number; // in seconds
}


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