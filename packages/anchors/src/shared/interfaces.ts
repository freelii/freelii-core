export enum PaymentRail {
    CRYPTO = "crypto",
    FIAT = "fiat"
}

export interface QuoteParams {
    sourceCurrency: string;
    targetCurrency: string;
}

export interface RecipientDetails {
    name: string;
    accountNumber: string;
    bankName?: string;
    ewalletProvider?: string;
    mobileNumber?: string;
}

export interface QuoteForTarget extends QuoteParams {
    targetAmount: string;
}

export interface QuoteForSource extends QuoteParams {
    sourceAmount: string;
}

export interface GetQuoteParams extends QuoteParams {
    sourceAmount?: string;
    targetAmount?: string;
    quoteId?: string;
    recipientDetails?: RecipientDetails;
}

export interface CashoutParams extends QuoteParams {
    targetAmount: number;
    recipientDetails: RecipientDetails;
}

export interface AnchorRate {
    exchangeRate: number;
    expiresIn?: number; // in seconds
}

export interface AnchorQuote extends AnchorRate {
    quoteId: string;
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount: string;
    targetAmount: string;
    fee: string;
    total: string;
}