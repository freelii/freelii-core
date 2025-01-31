export interface QuoteRequest {
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount?: string;
    targetAmount?: string;
}

export interface Quote {
    quoteId: string;
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount: string;
    price: string;
    targetAmount: string;
    expiry: string;
}