import type {
    AnchorQuote,
    GetQuoteParams,
    PaymentRail
} from "./interfaces";

// Abstract base class that all anchors must implement
export abstract class Anchor {
    abstract name: string;
    abstract supportedPaymentRails: PaymentRail[];
    abstract supportedCurrencies: string[];

    // Get quote for a specific transfer
    abstract getQuote(
        params: GetQuoteParams
    ): Promise<AnchorQuote>;

    // Check if anchor supports this type of transfer
    abstract supportsTransfer(
        sourceCurrency: string,
        destinationCurrency: string,
        paymentRail: PaymentRail
    ): boolean;
}