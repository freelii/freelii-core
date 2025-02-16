import type {
    AnchorQuote,
    AnchorRate,
    CashoutParams,
    GetQuoteParams,
    PaymentRail,
    QuoteParams
} from "./interfaces";

// Abstract base class that all anchors must implement
export abstract class Anchor {
    abstract name: string;
    abstract supportedPaymentRails: PaymentRail[];
    abstract supportedCurrencies: string[];

    // Get quote for a specific transfer
    abstract requestQuote(
        params: GetQuoteParams
    ): Promise<AnchorQuote>;

    // Get live fx rate for a specific trading pair
    abstract getRate(
        params: QuoteParams
    ): Promise<AnchorRate>;

    // Check if anchor supports this type of transfer
    abstract supportsTransfer(
        sourceCurrency: string,
        destinationCurrency: string,
        paymentRail: PaymentRail
    ): boolean;

    // Request a cash-out operation
    abstract requestCashout(
        params: CashoutParams
    ): Promise<any>;

    abstract getLiquidationAddress(): Promise<string>;

    abstract convertCurrency(
        sourceCurrency: string,
        destinationCurrency: string,
        sourceAmount: number,
        expectedTargetAmount: number,
    ): Promise<number>;

}